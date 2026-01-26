#!/usr/bin/env python3
"""
Generate complete OpenAPI specification files from parsed endpoint data.
Creates modular OpenAPI 3.0.3 specs with proper folder structure.
"""

import json
import re
from pathlib import Path
import yaml

def sanitize_filename(name):
    """Convert endpoint name to valid filename"""
    # Remove version indicators like (v3)
    name = re.sub(r'\s*\([^)]+\)', '', name)
    # Replace spaces and special chars with hyphens
    name = re.sub(r'[^\w\s-]', '', name)
    name = re.sub(r'[\s_]+', '-', name)
    return name.lower().strip('-')

def get_operation_id(method, name):
    """Generate operationId from method and name"""
    clean_name = re.sub(r'\s*\([^)]+\)', '', name)
    clean_name = re.sub(r'[^\w\s]', '', clean_name)
    clean_name = ''.join(word.capitalize() for word in clean_name.split())
    return f"{method.lower()}{clean_name}"

def get_tag_from_name(name):
    """Extract appropriate tag from endpoint name"""
    name_lower = name.lower()
    
    if 'login' in name_lower or 'password' in name_lower or 'token' in name_lower:
        return 'Authentication'
    elif 'mfa' in name_lower or 'multi-factor' in name_lower:
        return 'MFA'
    elif 'employee' in name_lower or 'user' in name_lower:
        return 'Users'
    elif 'market' in name_lower:
        return 'Markets'
    elif 'partner' in name_lower:
        return 'Partners'
    elif 'ix' in name_lower:
        return 'IX'
    elif 'port' in name_lower:
        return 'Ports'
    elif 'vxc' in name_lower:
        return 'VXCs'
    elif 'aws' in name_lower:
        return 'AWS'
    elif 'azure' in name_lower:
        return 'Azure'
    elif 'google' in name_lower:
        return 'Google'
    elif 'sap' in name_lower:
        return 'SAP'
    else:
        return 'General'

def extract_path_parameters(url):
    """Extract path parameters from URL"""
    # Match :param or {param} styles
    params = []
    
    # Find :param style
    colon_params = re.findall(r':(\w+)', url)
    for param in colon_params:
        params.append({
            'name': param,
            'in': 'path',
            'required': True,
            'schema': {'type': 'string'},
            'description': f'The {param} parameter'
        })
    
    # Find {param} style
    brace_params = re.findall(r'\{(\w+)\}', url)
    for param in brace_params:
        if param not in [p['name'] for p in params]:
            params.append({
                'name': param,
                'in': 'path',
                'required': True,
                'schema': {'type': 'string'},
                'description': f'The {param} parameter'
            })
    
    return params

def extract_query_parameters(url):
    """Extract query parameters from URL"""
    params = []
    
    # Find query params like ?key={value} or ?key=value
    query_params = re.findall(r'[?&](\w+)=', url)
    for param in query_params:
        params.append({
            'name': param,
            'in': 'query',
            'required': False,
            'schema': {'type': 'string'},
            'description': f'The {param} query parameter'
        })
    
    return params

def normalize_url(url):
    """Normalize URL for OpenAPI (convert :param to {param})"""
    # Convert :param to {param}
    url = re.sub(r':(\w+)', r'{\1}', url)
    # Remove query string for path definition
    url = url.split('?')[0]
    return url

def generate_path_spec(endpoint):
    """Generate OpenAPI path specification for an endpoint"""
    method = endpoint['method'].lower()
    name = endpoint['name']
    url = endpoint['url']
    
    if not url:
        return None
    
    normalized_url = normalize_url(url)
    operation_id = get_operation_id(method, name)
    tag = get_tag_from_name(name)
    
    # Extract parameters
    path_params = extract_path_parameters(url)
    query_params = extract_query_parameters(url)
    all_params = path_params + query_params
    
    # Build operation spec
    operation = {
        'operationId': operation_id,
        'tags': [tag],
        'summary': name,
        'description': endpoint.get('description', name),
        'responses': {
            '200': {
                'description': 'Successful response',
                'content': {
                    'application/json': {
                        'schema': {
                            'type': 'object',
                            'properties': {
                                'message': {'type': 'string'},
                                'terms': {'type': 'string'},
                                'data': {'type': 'object'}
                            }
                        }
                    }
                }
            },
            '400': {
                'description': 'Bad request',
                'content': {
                    'application/json': {
                        'schema': {'$ref': '#/components/schemas/ErrorResponse'}
                    }
                }
            },
            '401': {
                'description': 'Unauthorized',
                'content': {
                    'application/json': {
                        'schema': {'$ref': '#/components/schemas/ErrorResponse'}
                    }
                }
            }
        }
    }
    
    # Add parameters if any
    if all_params:
        operation['parameters'] = all_params
    
    # Add security for all except login endpoints
    if 'login' not in name.lower() and 'token' not in name.lower():
        operation['security'] = [{'BearerAuth': []}]
    
    # Add request body for POST/PUT/PATCH
    if method in ['post', 'put', 'patch']:
        operation['requestBody'] = {
            'required': True,
            'content': {
                'application/json': {
                    'schema': {'type': 'object'}
                }
            }
        }
    
    return {
        'path': normalized_url,
        'method': method,
        'operation': operation
    }

def generate_all_specs(endpoints):
    """Generate all OpenAPI specification files"""
    base_path = Path(__file__).parent.parent
    paths_dir = base_path / 'specs' / 'paths'
    
    # Group endpoints by path
    path_specs = {}
    all_tags = set()
    
    for endpoint in endpoints:
        spec = generate_path_spec(endpoint)
        if spec:
            path = spec['path']
            method = spec['method']
            operation = spec['operation']
            
            if path not in path_specs:
                path_specs[path] = {}
            
            path_specs[path][method] = operation
            all_tags.update(operation.get('tags', []))
    
    # Generate path files
    path_files = []
    for path, methods in path_specs.items():
        # Create filename from path
        filename = path.replace('/', '-').replace('{', '').replace('}', '').strip('-')
        if not filename:
            filename = 'root'
        
        filepath = paths_dir / f"{filename}.yaml"
        path_files.append(f"paths/{filename}.yaml")
        
        # Create path spec
        path_content = {path: methods}
        
        # Write file
        with open(filepath, 'w') as f:
            yaml.dump(path_content, f, default_flow_style=False, sort_keys=False)
        
        print(f"Created: {filepath.relative_to(base_path)}")
    
    return path_files, sorted(all_tags)

def update_main_spec(path_files, tags):
    """Update main OpenAPI specification file"""
    base_path = Path(__file__).parent.parent
    main_spec_path = base_path / 'specs' / 'megaport-api.yaml'
    
    # Read existing spec
    with open(main_spec_path, 'r') as f:
        content = f.read()
    
    # Extract base spec without paths (keep everything up to 'paths:')
    parts = content.split('paths:', 1)
    
    # Build new spec content manually to preserve formatting
    new_content = parts[0] + 'paths:\n'
    
    # Add $ref entries for all path files (using special tag format for file references)
    for path_file in sorted(path_files):
        new_content += f"  '{path_file}': !include ./{path_file}\n"
    
    # If there's a components section, preserve it
    if len(parts) > 1 and 'components:' in content:
        components_part = 'components:' + content.split('components:', 1)[1]
        new_content += '\n' + components_part
    else:
        # Add standard components section
        new_content += '''
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from login endpoint
  schemas:
    ErrorResponse:
      type: object
      properties:
        message:
          type: string
          description: Error message
        data:
          type: object
          description: Additional error details
'''
    
    # Write updated spec
    with open(main_spec_path, 'w') as f:
        f.write(new_content)
    
    print(f"\nUpdated: {main_spec_path.relative_to(base_path)}")
    return new_content

def main():
    base_path = Path(__file__).parent.parent
    endpoints_file = base_path / 'docs' / 'endpoints_by_section.json'
    
    # Load parsed endpoints
    with open(endpoints_file, 'r') as f:
        data = json.load(f)
    
    endpoints = [ep for ep in data['endpoints'] if ep.get('url')]
    
    print(f"Generating OpenAPI specs for {len(endpoints)} endpoints...\n")
    
    # Generate path specs
    path_files, tags = generate_all_specs(endpoints)
    
    print(f"\n{'='*60}")
    print(f"Generated {len(path_files)} path files")
    print(f"Found {len(tags)} tags: {', '.join(tags)}")
    print('='*60)
    
    # Update main spec
    update_main_spec(path_files, tags)
    
    print("\n✓ OpenAPI generation complete!")

if __name__ == '__main__':
    main()
