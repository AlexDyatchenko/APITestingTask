# Megaport API - OpenAPI Specification

This directory contains the complete OpenAPI 3.0.3 specification for the Megaport REST API.

## 📊 Specification Overview

- **OpenAPI Version**: 3.0.3
- **API Version**: 3.0.0
- **Total Endpoints**: 26 operations
- **API Versions Covered**: v2, v3
- **Format**: Modular YAML structure
- **Authentication**: Bearer JWT token

## 📁 Directory Structure

```
specs/
├── megaport-api.yaml              # Main OpenAPI specification (entry point)
├── components/
│   └── schemas/                    # Reusable schema definitions
│       ├── StandardResponse.yaml
│       ├── ErrorResponse.yaml
│       ├── LoginRequest.yaml
│       ├── LoginResponse.yaml
│       ├── Employment.yaml
│       ├── EmploymentListResponse.yaml
│       ├── MFAResetRequest.yaml
│       ├── MFAResponse.yaml
│       ├── TOTPQRCodeResponse.yaml
│       └── ChangePasswordRequest.yaml
└── paths/                          # Individual path definitions
    ├── v2-market.yaml
    ├── v2-employee-employeeId.yaml
    ├── v2-employee-employeeId-mfa.yaml
    ├── v3-login.yaml
    ├── v2-password-change.yaml
    ├── v2-dropdowns-partner-megaports.yaml
    ├── v2-product-ix-types.yaml
    ├── v3-networkdesign-validate.yaml
    ├── v3-networkdesign-buy.yaml
    ├── v2-secure-awshc.yaml
    ├── v3-product-vxc-productUid.yaml
    └── v2-service-key.yaml
```

## 🚀 Getting Started

### Viewing the Specification

#### Option 1: Swagger UI (Recommended)

```bash
# Install Swagger UI Docker
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/specs/megaport-api.yaml \
  -v $(pwd):/specs \
  swaggerapi/swagger-ui

# Open http://localhost:8080
```

#### Option 2: Redoc

```bash
# Install Redoc CLI
npm install -g @redocly/cli

# Preview documentation
redocly preview-docs specs/megaport-api.yaml

# Generate static HTML
redocly build-docs specs/megaport-api.yaml -o docs/api-documentation.html
```

#### Option 3: VS Code Extension

1. Install "OpenAPI (Swagger) Editor" extension
2. Open `specs/megaport-api.yaml`
3. Right-click → "Preview Swagger"

### Validating the Specification

```bash
# Using Redocly CLI
redocly lint specs/megaport-api.yaml

# Using Swagger CLI
swagger-cli validate specs/megaport-api.yaml
```

### Bundling (Combining all files into one)

```bash
# Using Redocly CLI
redocly bundle specs/megaport-api.yaml -o megaport-api-bundled.yaml

# Using Swagger CLI
swagger-cli bundle specs/megaport-api.yaml -o megaport-api-bundled.yaml -t yaml
```

## 🔑 Authentication

The API uses Bearer JWT authentication. To authenticate:

1. **Login** using the `/v3/login` endpoint with your credentials
2. **Extract the token** from the response
3. **Include the token** in all subsequent requests:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

Example:

```bash
# Login
curl -X POST https://api-staging.megaport.com/v3/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user@example.com","password":"yourpassword"}'

# Use token in requests
curl https://api-staging.megaport.com/v2/market \
  -H "Authorization: Bearer eyJhbGc..."
```

## 🌐 API Environments

### Production

- **Base URL**: `https://api.megaport.com`
- **Description**: Live environment - All orders are billable
- **Use for**: Production applications

### Staging

- **Base URL**: `https://api-staging.megaport.com`
- **Description**: Test environment - Reset every 24 hours
- **Use for**: Development and testing
- **Note**: No billing applies

## 📚 API Categories

### Authentication

- POST `/v3/login` - Log in with username and password
- POST `/v2/password/change` - Change password

### Users

- PUT `/v2/employee/:employeeId` - Update user details
- DELETE `/v2/employee/:employeeId` - Delete invited user

### MFA (Multi-Factor Authentication)

- PUT `/v2/employee/:employeeId/mfa` - Reset MFA
- DELETE `/v2/employee/:employeeId/mfa` - Disable MFA

### Markets

- GET `/v2/market` - Get billing markets

### Partners

- GET `/v2/dropdowns/partner/megaports` - Get partner megaports

### IX (Internet Exchange)

- GET `/v2/product/ix/types` - Get IX locations

### Ports

- POST `/v3/networkdesign/validate` - Validate port order
- POST `/v3/networkdesign/buy` - Buy port

### VXCs (Virtual Cross Connects)

- POST `/v3/networkdesign/buy` - Create VXC to SAP
- PUT `/v3/product/vxc/{productUid}` - Update VXC (Azure, Google, AWS)

### AWS

- GET `/v2/secure/awshc` - Look up AWS Hosted Connection port details

### SAP

- GET `/v2/service/key` - Look up SAP service key

## 🛠️ Code Generation

Generate client libraries in various languages using OpenAPI Generator:

```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate Python client
openapi-generator-cli generate \
  -i specs/megaport-api.yaml \
  -g python \
  -o clients/python

# Generate JavaScript/TypeScript client
openapi-generator-cli generate \
  -i specs/megaport-api.yaml \
  -g typescript-axios \
  -o clients/typescript

# Generate Java client
openapi-generator-cli generate \
  -i specs/megaport-api.yaml \
  -g java \
  -o clients/java
```

## 📖 Additional Documentation

- **Official API Docs**: https://docs.megaport.com/
- **Acceptable Use Policy**: https://www.megaport.com/legal/acceptable-use-policy
- **Generation Summary**: See [OPENAPI_GENERATION_SUMMARY.md](../OPENAPI_GENERATION_SUMMARY.md)

## 🔄 Regenerating Specifications

If you need to regenerate the OpenAPI specs from the HTML documentation:

```bash
# Step 1: Parse the HTML documentation
python3 scripts/section_parser.py

# Step 2: Generate OpenAPI YAML files
python3 scripts/generate_openapi.py
```

Output files:

- Parsed data: `docs/endpoints_by_section.json`
- OpenAPI specs: `specs/paths/*.yaml` and `specs/megaport-api.yaml`

## 📊 Statistics

- **Total Operations**: 26 API operations
- **v2 Endpoints**: 8 paths
- **v3 Endpoints**: 4 paths
- **Legacy Files**: 5 files (from previous generation)
- **Schemas**: 10 reusable component schemas
- **Tags**: 9 logical categories
- **Security Schemes**: 1 (Bearer Auth)

## ⚠️ Known Limitations

1. **Schemas**: Some endpoint request/response schemas use generic `type: object` and need detailed schemas from JSON examples
2. **Descriptions**: Some endpoint descriptions are minimal and could be enriched from HTML documentation
3. **Examples**: Request/response examples are not included in all endpoints
4. **Missing Endpoint**: "Generate Access Token - Staging" URL not found in documentation

## 🤝 Contributing

To improve the OpenAPI specification:

1. Extract detailed schemas from `docs/api_docs.html` JSON examples
2. Add comprehensive descriptions for each endpoint
3. Include request/response examples
4. Validate changes with `redocly lint specs/megaport-api.yaml`
5. Test bundled spec with Swagger UI

## 📝 License

This OpenAPI specification is for the Megaport REST API. Please refer to Megaport's terms of service and acceptable use policy.

---

**Generated**: 2025-01-19  
**Source**: Megaport API Postman Documentation (1.8 MB HTML export)  
**Parser**: `scripts/section_parser.py` + `scripts/generate_openapi.py`  
**Contact**: techpubs@megaport.com
