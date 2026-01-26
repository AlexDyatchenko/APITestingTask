#!/usr/bin/env python3
"""
Section-based HTML parser for Megaport API documentation.
Extracts complete endpoint information by parsing HTML sections.
"""

import re
import json
from pathlib import Path

def extract_endpoint_from_section(section_html, section_id):
    """Extract complete endpoint information from an HTML section"""
    endpoint = {
        'section_id': section_id,
        'method': None,
        'name': None,
        'url': None,
        'parameters': [],
        'request_body': None,
        'response_examples': []
    }
    
    # Extract method and name from request header
    method_name_pattern = r'<span class="sc-fzoaKM [^"]+">(\w+)</span><span class="sc-fzomuh eaYntv documentation-core-item-request-name">([^<]+)</span>'
    method_name_match = re.search(method_name_pattern, section_html)
    if method_name_match:
        endpoint['method'] = method_name_match.group(1)
        endpoint['name'] = method_name_match.group(2).strip()
    
    # Extract URL from the same section
    # Look for URL patterns in the section
    url_patterns = [
        r'https://api-staging\.megaport\.com(/v\d+/[^\s"\'<>&]+)',
        r'"url"\s*:\s*"https://api-staging\.megaport\.com(/v\d+/[^\s"\']+)"',
        r'href="https://api-staging\.megaport\.com(/v\d+/[^\s"\'<>&]+)"'
    ]
    
    for pattern in url_patterns:
        url_match = re.search(pattern, section_html)
        if url_match:
            endpoint['url'] = url_match.group(1)
            # Clean up HTML entities
            endpoint['url'] = endpoint['url'].replace('&amp;', '&')
            endpoint['url'] = endpoint['url'].replace('&#x27;', "'")
            # Remove trailing quotes/apostrophes
            endpoint['url'] = endpoint['url'].rstrip("'\"")
            break
    
    # Extract description
    desc_pattern = r'<div class="sc-fzoJIu [^"]+">([^<]+)</div>'
    desc_match = re.search(desc_pattern, section_html)
    if desc_match:
        endpoint['description'] = desc_match.group(1).strip()
    
    return endpoint

def parse_api_docs_by_sections(html_file_path):
    """Parse HTML documentation by sections"""
    print(f"Parsing {html_file_path} by sections...")
    
    with open(html_file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    print(f"File size: {len(html_content)} bytes")
    
    # Find all sections with IDs
    section_pattern = r'<section id="([^"]+)"[^>]*>(.*?)</section>'
    sections = re.findall(section_pattern, html_content, re.DOTALL)
    
    print(f"Found {len(sections)} sections")
    
    endpoints = []
    
    for section_id, section_content in sections:
        endpoint = extract_endpoint_from_section(section_content, section_id)
        if endpoint['method'] and endpoint['name']:
            endpoints.append(endpoint)
    
    # Group endpoints by API version
    version_groups = {'v1': [], 'v2': [], 'v3': [], 'v4': []}
    unversioned = []
    
    for endpoint in endpoints:
        if endpoint['url']:
            version_match = re.match(r'/v(\d+)/', endpoint['url'])
            if version_match:
                version = f"v{version_match.group(1)}"
                if version in version_groups:
                    version_groups[version].append(endpoint)
            else:
                unversioned.append(endpoint)
    
    # Statistics
    stats = {
        'total_endpoints': len(endpoints),
        'by_version': {v: len(eps) for v, eps in version_groups.items() if eps},
        'unversioned': len(unversioned),
        'by_method': {}
    }
    
    for endpoint in endpoints:
        method = endpoint['method']
        if method:
            stats['by_method'][method] = stats['by_method'].get(method, 0) + 1
    
    return {
        'endpoints': endpoints,
        'version_groups': version_groups,
        'unversioned': unversioned,
        'stats': stats
    }

def main():
    html_file = Path(__file__).parent.parent / 'docs' / 'api_docs.html'
    output_file = Path(__file__).parent.parent / 'docs' / 'endpoints_by_section.json'
    
    result = parse_api_docs_by_sections(html_file)
    
    # Save results
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)
    
    print(f"\n{'='*60}")
    print("PARSING RESULTS")
    print('='*60)
    print(f"Total endpoints found: {result['stats']['total_endpoints']}")
    print(f"\nEndpoints by HTTP method:")
    for method, count in sorted(result['stats']['by_method'].items()):
        print(f"  {method}: {count}")
    
    print(f"\nEndpoints by API version:")
    for version, count in sorted(result['stats']['by_version'].items()):
        print(f"  {version}: {count}")
    
    if result['stats']['unversioned']:
        print(f"  Unversioned: {result['stats']['unversioned']}")
    
    print(f"\nResults saved to: {output_file}")
    
    # Show sample endpoints
    print(f"\n{'='*60}")
    print("SAMPLE ENDPOINTS (First 10)")
    print('='*60)
    for i, endpoint in enumerate(result['endpoints'][:10], 1):
        print(f"\n{i}. {endpoint['method']} - {endpoint['name']}")
        print(f"   URL: {endpoint['url'] or 'NOT FOUND'}")
        if endpoint.get('description'):
            print(f"   Description: {endpoint['description'][:80]}...")
    
    # Show endpoints without URLs
    no_url = [ep for ep in result['endpoints'] if not ep['url']]
    if no_url:
        print(f"\n{'='*60}")
        print(f"WARNING: {len(no_url)} endpoints without URLs")
        print('='*60)
        for endpoint in no_url[:5]:
            print(f"  {endpoint['method']} - {endpoint['name']}")

if __name__ == '__main__':
    main()
