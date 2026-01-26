#!/usr/bin/env python3
"""
Comprehensive Megaport API Documentation Parser
Extracts all endpoint information from the HTML documentation
"""

import re
import json
from pathlib import Path
from collections import defaultdict

def extract_endpoints_from_html(html_file_path):
    """Extract all endpoint information from the Megaport API HTML documentation"""
    
    with open(html_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    endpoints = []
    
    # Pattern 1: Extract endpoint request sections  
    # Looking for patterns like: <span class="sc-fzoaKM METHOD">METHOD</span><span class="sc-fzomuh...">ENDPOINT_NAME</span>
    method_pattern = r'<span class="sc-fzoaKM [^"]+">(\w+)</span><span class="sc-fzomuh eaYntv documentation-core-item-request-name">([^<]+)</span>'
    method_matches = re.findall(method_pattern, content)
    
    # Pattern 2: Extract URLs
    # Looking for patterns like: https://api-staging.megaport.com/v[X]/...
    url_pattern = r'https://api-staging\.megaport\.com(/v\d+/[^"<\s]+)'
    url_matches = re.findall(url_pattern, content)
    
    # Pattern 3: Extract navigation item endpoints (GET, POST, PUT, DELETE with names)
    nav_pattern = r'<div class="sc-fzplgP ([^"]+)">(\w+)</div><div class="sc-fzonjX jMaMuX documentation-core-list__item-name">([^<]+)</div>'
    nav_matches = re.findall(nav_pattern, content)
    
    # Combine method matches with navigation matches
    print(f"Found {len(method_matches)} method/name pairs")
    print(f"Found {len(url_matches)} unique URLs")
    print(f"Found {len(nav_matches)} navigation items")
    
    # Build endpoint list from method matches
    for method, name in method_matches:
        endpoints.append({
            'method': method,
            'name': name.strip(),
            'url': None,
            'source': 'main_content'
        })
    
    # Add navigation endpoints
    for css_class, method, name in nav_matches:
        endpoints.append({
            'method': method,
            'name': name.strip(),
            'url': None,
            'source': 'navigation'
        })
    
    # Extract section IDs and their descriptions
    section_pattern = r'<section id="([^"]+)"[^>]*>.*?<h3[^>]*>.*?<span class="sc-fzoaKM ([^"]+)">(\w+)</span><span[^>]*>([^<]+)</span>'
    section_matches = re.findall(section_pattern, content, re.DOTALL)
    
    print(f"Found {len(section_matches)} section definitions")
    
    # Create a more comprehensive list
    endpoint_dict = {}
    for section_id, css_class, method, name in section_matches:
        key = f"{method}_{name.strip()}"
        endpoint_dict[key] = {
            'method': method,
            'name': name.strip(),
            'section_id': section_id,
            'url': None
        }
    
    # Try to match URLs to endpoints
    for url in set(url_matches):
        # Try to find which endpoint this URL belongs to
        for key, endpoint in endpoint_dict.items():
            if endpoint['url'] is None:
                endpoint['url'] = url
                break
    
    # Extract all paths from content
    # Looking for v2, v3, v4 endpoints
    path_pattern = r'/v(\d+)/([^\s"\'<>]+)'
    all_paths = re.findall(path_pattern, content)
    
    paths_by_version = defaultdict(set)
    for version, path in all_paths:
        clean_path = path.rstrip('/').rstrip(',').rstrip('"').rstrip("'")
        paths_by_version[version].add(clean_path)
    
    print("\nPaths by API version:")
    for version in sorted(paths_by_version.keys()):
        print(f"  v{version}: {len(paths_by_version[version])} unique paths")
    
    # Extract endpoint descriptions from paragraphs
    desc_pattern = r'<p><span>([^<]+)</span></p>'
    descriptions = re.findall(desc_pattern, content)
    
    return {
        'endpoints': list(endpoint_dict.values()),
        'all_endpoints': endpoints,
        'paths_by_version': {k: sorted(list(v)) for k, v in paths_by_version.items()},
        'total_unique_paths': sum(len(v) for v in paths_by_version.values()),
        'descriptions': descriptions[:50]  # Sample of descriptions
    }

def main():
    html_file = Path('/home/test/APITestingTask/docs/api_docs.html')
    
    if not html_file.exists():
        print(f"Error: {html_file} not found")
        return 1
    
    print(f"Parsing {html_file}...")
    print(f"File size: {html_file.stat().st_size:,} bytes")
    
    results = extract_endpoints_from_html(html_file)
    
    # Save results
    output_file = Path('/home/test/APITestingTask/docs/parsed_endpoints.json')
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n=== SUMMARY ===")
    print(f"Total endpoints found: {len(results['endpoints'])}")
    print(f"Total endpoint mentions: {len(results['all_endpoints'])}")
    print(f"Total unique API paths: {results['total_unique_paths']}")
    print(f"\nResults saved to: {output_file}")
    
    # Print sample endpoints
    print("\n=== SAMPLE ENDPOINTS ===")
    for endpoint in results['endpoints'][:10]:
        print(f"{endpoint['method']:6} {endpoint['name']}")
        if endpoint.get('url'):
            print(f"       {endpoint['url']}")
    
    return 0

if __name__ == '__main__':
    exit(main())
