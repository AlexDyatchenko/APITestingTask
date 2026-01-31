import os
import yaml
from pathlib import Path

# Paths
WORKSPACE = Path("/home/test/APITestingTask")
SPECS_DIR = WORKSPACE / "specs/paths"
TESTS_DIR = WORKSPACE / "tests/api"

def generate_test_file(yaml_path, relative_path):
    with open(yaml_path, 'r') as f:
        try:
            data = yaml.safe_load(f)
        except yaml.YAMLError as exc:
            print(f"Error reading {yaml_path}: {exc}")
            return

    # Extract info (usually one endpoint per file in this structure based on previous `ls`)
    # Check key structure
    if not isinstance(data, dict):
        return

    endpoint = list(data.keys())[0] if data else None
    if not endpoint or not endpoint.startswith('/'):
        # Fallback if structure is different
        # print(f"Skipping {yaml_path}: No valid endpoint found")
        return

    methods = data[endpoint]
    if not isinstance(methods, dict): 
        return

    # Prefer GET, then POST, etc.
    preferred_methods = ['get', 'post', 'put', 'delete', 'patch']
    method = next((m for m in preferred_methods if m in methods), None)

    if not method:
        return
        
    details = methods[method]
    summary = details.get('summary', f"{method.upper()} {endpoint}")
    
    # Calculate output path
    # specs/paths/subdir/file.yaml -> tests/api/subdir/file.spec.ts
    output_rel = relative_path.with_suffix('.spec.ts')
    output_path = TESTS_DIR / output_rel
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Determine import depth
    # tests/api is the root for relative_path
    # if tests/api/subdir/file.spec.ts -> depth 1 from api -> ../../utils
    # tests/api/file.spec.ts -> depth 0 -> ../utils
    
    # relative_path components. e.g. locations/v3.locations.spec.ts is 2 parts
    depth = len(output_rel.parts) - 1
    # Base is inside tests/api. So depth 0 needs ../utils (up one to tests, up one to api? No.)
    # tests/api/x.ts. Root of tests is tests/
    # utils is parallel to tests.
    # so we need to go up from x.ts to api, then tests, then root.
    # logic:
    # tests/api/foo.ts -> ../../utils/api-test-factory
    # tests/api/bar/foo.ts -> ../../../utils/api-test-factory
    
    # Actually, let's trace:
    # tests/api/v2.locations.spec.ts imports "../../utils/api"
    # So depth 0 (api root) is ../../
    
    dots = "../" * (depth + 2) # +2 for api/ and tests/

    # Generate content
    content = f"""import {{ createApiTest }} from "{dots}utils/api-test-factory";

createApiTest({{
  endpoint: "{endpoint}",
  method: "{method.upper()}",
  title: "{summary.replace('"', '\\"')}",
  // schema: require("./path/to/schema"), 
  validParams: {{ 
    // TODO: Add required query params
  }},
  validBody: {{
    // TODO: Add required body params
  }}
}});
"""
    
    with open(output_path, 'w') as f:
        f.write(content)
    print(f"Generated {output_path}")

def main():
    if not SPECS_DIR.exists():
        print(f"Specs dir not found: {SPECS_DIR}")
        return

    for yaml_file in SPECS_DIR.rglob("*.yaml"):
        rel_path = yaml_file.relative_to(SPECS_DIR)
        generate_test_file(yaml_file, rel_path)

if __name__ == "__main__":
    main()
