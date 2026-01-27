import yaml
import os
import shutil
import re

def clean_tag_name(name):
    """Clean tag name for directory usage."""
    # Replace special chars, keep alphanumeric and dashes
    clean = re.sub(r'[^a-zA-Z0-9-]', '-', name.lower())
    # Remove recurring dashes
    clean = re.sub(r'-+', '-', clean).strip('-')
    return clean if clean else "default"

def split_openapi():
    source_file = "/home/test/APITestingTask/specs/megaport-api-converted.yaml"
    output_base = "/home/test/APITestingTask/specs"
    
    with open(source_file, 'r') as f:
        data = yaml.safe_load(f)
    
    # 1. Save main openapi.yaml
    openapi_main = {
        "openapi": data.get("openapi", "3.0.0"),
        "info": data.get("info", {}),
        "servers": data.get("servers", []),
        "security": data.get("security", []),
        "tags": [], # Will fill this
        "paths": {},
        "components": {
            "securitySchemes": data.get("components", {}).get("securitySchemes", {}),
            "schemas": {} # Will ref schemas if we had them, but current conversion doesn't have many models
        }
    }
    
    # Map tags to their description
    tags_info = {t['name']: t for t in data.get('tags', [])}
    used_tags = set()
    
    paths = data.get('paths', {})
    
    print(f"Processing {len(paths)} paths...")
    
    for path, methods in paths.items():
        # Determine primary tag for this path
        # Heuristic: use the first tag of the first method
        path_tag = "default"
        
        # Try to find a common tag
        for method, op in methods.items():
            if 'tags' in op and op['tags']:
                path_tag = op['tags'][0]
                break
        
        # Clean tag for folder name
        folder_name = clean_tag_name(path_tag)
        used_tags.add(path_tag)
        
        # Create folder
        folder_path = os.path.join(output_base, "paths", folder_name)
        os.makedirs(folder_path, exist_ok=True)
        
        # Create filename from path
        # e.g. /v2/locations -> v2-locations.yaml
        file_name = re.sub(r'[^a-zA-Z0-9]', '-', path).strip('-') 
        file_name = re.sub(r'-+', '-', file_name) + ".yaml"
        
        full_file_path = os.path.join(folder_path, file_name)
        
        # Save individual path file
        with open(full_file_path, 'w') as f:
            yaml.dump({path: methods}, f, sort_keys=False)
            
        # Add ref to main openapi
        # Reference path relative to specs/openapi.yaml
        ref_path = f"./paths/{folder_name}/{file_name}"
        openapi_main["paths"][path] = {"$ref": ref_path}

    # valid tags
    for tag in used_tags:
        if tag in tags_info:
            openapi_main["tags"].append(tags_info[tag])
        else:
            openapi_main["tags"].append({"name": tag})
            
    # Save root openapi.yaml
    with open(os.path.join(output_base, "openapi.yaml"), 'w') as f:
        yaml.dump(openapi_main, f, sort_keys=False)

    print("Split complete.")

if __name__ == "__main__":
    split_openapi()
