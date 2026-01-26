#!/usr/bin/env python3
"""
Parse Megaport API documentation HTML file and extract all endpoints.
"""

from html.parser import HTMLParser
import json
import re

class PostmanHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.endpoints = []
        self.current_endpoint = {}
        self.in_request_name = False
        self.in_request_url = False
        self.capture_text = False
        self.text_buffer = ''
        
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if 'class' in attrs_dict:
            classes = attrs_dict['class'].split()
            if 'documentation-core-item-request-name' in classes:
                self.in_request_name = True
                self.capture_text = True
            elif 'documentation-core-item-request-url' in classes:
                self.in_request_url = True
                self.capture_text = True
                
    def handle_data(self, data):
        if self.capture_text:
            self.text_buffer += data.strip()
            
    def handle_endtag(self, tag):
        if self.in_request_name and self.text_buffer:
            self.current_endpoint['name'] = self.text_buffer
            self.text_buffer = ''
            self.in_request_name = False
            self.capture_text = False
        elif self.in_request_url and self.text_buffer:
            # Extract method and URL
            parts = self.text_buffer.split()
            if len(parts) >= 2:
                self.current_endpoint['method'] = parts[0]
                url = ' '.join(parts[1:])
                # Clean up URL
                url = url.replace('https://api-staging.megaport.com', '')
                url = url.replace('https://api.megaport.com', '')
                self.current_endpoint['url'] = url
                if 'name' in self.current_endpoint and 'method' in self.current_endpoint:
                    self.endpoints.append(self.current_endpoint.copy())
                    self.current_endpoint = {}
            self.text_buffer = ''
            self.in_request_url = False
            self.capture_text = False

def main():
    parser = PostmanHTMLParser()
    with open('docs/api_docs.html', 'r', encoding='utf-8') as f:
        parser.feed(f.read())

    # Print unique endpoints
    seen = set()
    unique_endpoints = []
    for ep in parser.endpoints:
        key = f"{ep['method']} {ep['url']}"
        if key not in seen:
            seen.add(key)
            unique_endpoints.append(ep)
            
    # Print summary
    print(f"Total unique endpoints found: {len(unique_endpoints)}\n")
    
    # Group by method
    by_method = {}
    for ep in unique_endpoints:
        method = ep['method']
        if method not in by_method:
            by_method[method] = []
        by_method[method].append(ep)
    
    print("Endpoints by method:")
    for method, eps in sorted(by_method.items()):
        print(f"  {method}: {len(eps)}")
    
    print("\n" + "="*80 + "\n")
    print("All endpoints:\n")
    
    for ep in unique_endpoints:
        print(json.dumps(ep, indent=2))

if __name__ == '__main__':
    main()
