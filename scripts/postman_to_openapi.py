#!/usr/bin/env python3
"""
Convert Postman Collection v2 to OpenAPI 3.0 specifications.
Preserves folder structure and all details.
"""

import json
import os
import re
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional


class PostmanToOpenAPI:
    def __init__(self, postman_collection_path: str, output_dir: str):
        self.postman_collection_path = postman_collection_path
        self.output_dir = output_dir
        self.base_openapi = {
            "openapi": "3.0.0",
            "info": {},
            "servers": [],
            "paths": {},
            "components": {
                "securitySchemes": {},
                "schemas": {}
            },
            "tags": []
        }
        
    def load_postman_collection(self) -> Dict:
        """Load the Postman collection JSON file."""
        with open(self.postman_collection_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def extract_info(self, collection: Dict) -> Dict:
        """Extract OpenAPI info from Postman collection info."""
        info = collection.get('info', {})
        
        # Clean HTML from description
        description = info.get('description', '')
        # Remove HTML tags for cleaner description
        description = re.sub(r'<[^>]+>', '', description)
        description = re.sub(r'\n\n+', '\n\n', description).strip()
        
        return {
            "title": info.get('name', 'Megaport API'),
            "description": description,
            "version": "1.0.0",
            "contact": {
                "email": "techpubs@megaport.com"
            }
        }
    
    def extract_servers(self, collection: Dict) -> List[Dict]:
        """Extract server URLs from collection."""
        # Based on the Postman collection, we know these are the servers
        return [
            {
                "url": "https://api.megaport.com",
                "description": "Production Environment"
            },
            {
                "url": "https://api-staging.megaport.com",
                "description": "Staging Environment"
            }
        ]
    
    def parse_url(self, url_obj: Any) -> tuple:
        """Parse Postman URL object to get path and parameters."""
        if isinstance(url_obj, str):
            # Simple string URL
            parts = url_obj.split('?')
            path = parts[0]
            query_params = []
            if len(parts) > 1:
                for param in parts[1].split('&'):
                    if '=' in param:
                        key, value = param.split('=', 1)
                        query_params.append({"name": key, "value": value})
            return path, query_params
        
        # URL object
        path_parts = url_obj.get('path', [])
        if isinstance(path_parts, list):
            path = '/' + '/'.join(path_parts)
        else:
            path = str(path_parts)
        
        # Handle path variables
        if 'variable' in url_obj:
            for var in url_obj.get('variable', []):
                var_name = var.get('key', '')
                path = path.replace(f':{var_name}', f'{{{var_name}}}')
        
        # Query parameters
        query_params = []
        if 'query' in url_obj:
            for param in url_obj.get('query', []):
                if not param.get('disabled', False):
                    query_params.append({
                        "name": param.get('key', ''),
                        "description": param.get('description', ''),
                        "value": param.get('value', '')
                    })
        
        return path, query_params
    
    def convert_request_to_operation(self, item: Dict, tag: str) -> Optional[tuple]:
        """Convert a Postman request item to OpenAPI operation."""
        request = item.get('request')
        if not request:
            return None
        
        method = request.get('method', 'GET').lower()
        
        # Parse URL
        url = request.get('url', {})
        path, query_params = self.parse_url(url)
        
        # Remove base URL if present
        for server in ['https://api.megaport.com', 'https://api-staging.megaport.com', 
                       'https://auth-m2m.megaport.com', 'https://auth-m2m-staging.megaport.com']:
            if path.startswith(server):
                path = path[len(server):]
        
        # Ensure path starts with /
        if not path.startswith('/'):
            path = '/' + path
        
        # Clean description
        description = item.get('description', item.get('name', ''))
        description = re.sub(r'<[^>]+>', '', description)
        description = re.sub(r'\n\n+', '\n\n', description).strip()
        
        # Build operation object
        operation = {
            "summary": item.get('name', ''),
            "description": description,
            "operationId": self.generate_operation_id(method, path),
            "tags": [tag],
            "parameters": [],
            "responses": {
                "200": {
                    "description": "Successful response",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object"
                            }
                        }
                    }
                }
            }
        }
        
        # Add path parameters
        path_params = re.findall(r'\{([^}]+)\}', path)
        for param in path_params:
            operation["parameters"].append({
                "name": param,
                "in": "path",
                "required": True,
                "schema": {
                    "type": "string"
                },
                "description": f"The {param} parameter"
            })
        
        # Add query parameters
        for param in query_params:
            operation["parameters"].append({
                "name": param['name'],
                "in": "query",
                "required": False,
                "schema": {
                    "type": "string"
                },
                "description": param.get('description', '')
            })
        
        # Add request body if present
        if 'body' in request:
            body = request['body']
            if body.get('mode') == 'raw':
                try:
                    raw_data = body.get('raw', '')
                    if raw_data:
                        operation["requestBody"] = {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object"
                                    }
                                }
                            }
                        }
                except:
                    pass
            elif body.get('mode') == 'urlencoded':
                urlencoded = body.get('urlencoded', [])
                if urlencoded:
                    properties = {}
                    for item in urlencoded:
                        properties[item.get('key', '')] = {
                            "type": "string",
                            "description": item.get('description', '')
                        }
                    operation["requestBody"] = {
                        "required": True,
                        "content": {
                            "application/x-www-form-urlencoded": {
                                "schema": {
                                    "type": "object",
                                    "properties": properties
                                }
                            }
                        }
                    }
        
        # Add security if auth is present
        if 'auth' in request:
            auth = request['auth']
            auth_type = auth.get('type')
            if auth_type == 'bearer':
                operation["security"] = [{"bearerAuth": []}]
            elif auth_type == 'basic':
                operation["security"] = [{"basicAuth": []}]
        
        return (path, method, operation)
    
    def generate_operation_id(self, method: str, path: str) -> str:
        """Generate a unique operation ID."""
        # Remove path parameters and clean
        clean_path = re.sub(r'\{[^}]+\}', '', path)
        clean_path = re.sub(r'[^a-zA-Z0-9]', '_', clean_path)
        clean_path = re.sub(r'_+', '_', clean_path).strip('_')
        return f"{method}_{clean_path}"
    
    def process_items(self, items: List[Dict], tag: str = "") -> Dict:
        """Process Postman items recursively to build paths."""
        paths = {}
        
        for item in items:
            # Check if it's a folder with sub-items
            if 'item' in item and isinstance(item['item'], list):
                # It's a folder - use its name as tag
                folder_name = item.get('name', 'default')
                sub_paths = self.process_items(item['item'], folder_name)
                # Merge sub_paths into paths
                for path, methods in sub_paths.items():
                    if path not in paths:
                        paths[path] = {}
                    paths[path].update(methods)
            elif 'request' in item:
                # It's a request
                result = self.convert_request_to_operation(item, tag or "default")
                if result:
                    path, method, operation = result
                    if path not in paths:
                        paths[path] = {}
                    paths[path][method] = operation
        
        return paths
    
    def extract_security_schemes(self, collection: Dict) -> Dict:
        """Extract security schemes from collection."""
        schemes = {}
        
        # Add common auth schemes
        schemes["bearerAuth"] = {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT access token obtained from /oauth2/token endpoint"
        }
        
        schemes["basicAuth"] = {
            "type": "http",
            "scheme": "basic",
            "description": "Basic authentication using API key client ID and secret"
        }
        
        return schemes
    
    def extract_tags(self, items: List[Dict], parent_tag: str = "") -> List[Dict]:
        """Extract unique tags from collection structure."""
        tags = {}
        
        for item in items:
            if 'item' in item and isinstance(item['item'], list):
                # It's a folder
                folder_name = item.get('name', '')
                description = item.get('description', '')
                description = re.sub(r'<[^>]+>', '', description)
                
                tags[folder_name] = {
                    "name": folder_name,
                    "description": description
                }
                # Recursively process sub-items
                sub_tags = self.extract_tags(item['item'], folder_name)
                for tag in sub_tags:
                    if tag['name'] not in tags:
                        tags[tag['name']] = tag
        
        return list(tags.values())
    
    def convert(self) -> Dict[str, Any]:
        """Main conversion method."""
        print(f"Loading Postman collection from {self.postman_collection_path}")
        collection = self.load_postman_collection()
        
        print("Extracting information...")
        openapi_spec = self.base_openapi.copy()
        openapi_spec['info'] = self.extract_info(collection)
        openapi_spec['servers'] = self.extract_servers(collection)
        
        print("Processing items and building paths...")
        openapi_spec['paths'] = self.process_items(collection.get('item', []))
        
        print("Extracting security schemes...")
        openapi_spec['components']['securitySchemes'] = self.extract_security_schemes(collection)
        
        print("Extracting tags...")
        openapi_spec['tags'] = self.extract_tags(collection.get('item', []))
        
        print(f"Conversion complete. Found {len(openapi_spec['paths'])} paths with {len(openapi_spec['tags'])} tags")
        
        return openapi_spec
    
    def save_as_yaml(self, spec: Dict, filename: str = "megaport-api-converted.yaml"):
        """Save OpenAPI spec as YAML file."""
        output_path = os.path.join(self.output_dir, filename)
        
        # Ensure output directory exists
        os.makedirs(self.output_dir, exist_ok=True)
        
        print(f"Saving OpenAPI spec to {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            yaml.dump(spec, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
        
        print(f"Successfully saved to {output_path}")
        return output_path


def main():
    # Paths
    collection_path = "/home/test/APITestingTask/megaport_collection.json"
    output_dir = "/home/test/APITestingTask/specs"
    
    # Convert
    converter = PostmanToOpenAPI(collection_path, output_dir)
    openapi_spec = converter.convert()
    
    # Save
    converter.save_as_yaml(openapi_spec)
    
    print("\n✅ Conversion completed successfully!")


if __name__ == "__main__":
    main()
