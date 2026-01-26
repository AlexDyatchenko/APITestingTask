# Megaport API OpenAPI Specification

This directory contains the OpenAPI 3.0 specification for the Megaport API, organized following industry best practices for maintainability and scalability.

## 📁 Structure

```
specs/
├── megaport-api.yaml              # Main OpenAPI spec file (entry point)
├── components/
│   └── schemas/
│       ├── StandardResponse.yaml   # Common response wrapper
│       ├── ErrorResponse.yaml      # Error response structure
│       ├── LoginRequest.yaml       # Login request schema
│       ├── LoginResponse.yaml      # Login response schema
│       ├── Employment.yaml         # Employee/user model
│       ├── EmploymentListResponse.yaml
│       ├── MFAResetRequest.yaml    # MFA reset request
│       └── MFAResponse.yaml        # MFA response
└── paths/
    ├── authentication.yaml         # /v3/login endpoint
    ├── employment.yaml             # /v2/employment endpoint
    └── mfa.yaml                    # MFA-related endpoints
```

## 🎯 Design Principles

### 1. **Modular Architecture**

- **Main file** (`megaport-api.yaml`): Contains metadata, servers, tags, security schemes, and references
- **Components**: Reusable schemas for request/response models
- **Paths**: Endpoint definitions organized by resource type

### 2. **Hierarchy Based on Official Documentation**

The API is organized following the official Megaport API documentation structure:

| Category                        | Endpoints                            | Status         |
| ------------------------------- | ------------------------------------ | -------------- |
| **Authentication**              | `/v3/login`                          | ✅ Implemented |
| **User Management**             | `/v2/employment`                     | ✅ Implemented |
| **Multi-Factor Authentication** | `/v2/employee/{employeeId}/mfa/*`    | ✅ Implemented |
| Locations                       | `/v3/locations`, `/v2/locations`     | 🔄 To be added |
| Ordering Services               | `/v3/networkdesign/*`                | 🔄 To be added |
| Ports                           | `/v2/product/megaport/*`             | 🔄 To be added |
| Connections (VXC)               | `/v2/product/vxc/*`                  | 🔄 To be added |
| Cloud Connectivity              | Various CSP endpoints                | 🔄 To be added |
| MCR                             | `/v2/product/mcr2/*`                 | 🔄 To be added |
| MVE                             | `/v2/product/mve/*`                  | 🔄 To be added |
| IX                              | `/v2/product/ix/*`                   | 🔄 To be added |
| Marketplace                     | Marketplace endpoints                | 🔄 To be added |
| Product Details                 | `/v2/product/{uid}`, `/v2/products`  | 🔄 To be added |
| Service Status                  | Status endpoints                     | 🔄 To be added |
| Maintenance                     | `/ens/v1/status/*`                   | 🔄 To be added |
| Pricing                         | `/v3/pricebook/*`                    | 🔄 To be added |
| Invoices                        | `/v3/company/{companyUid}/invoice/*` | 🔄 To be added |
| Notifications                   | `/v3/notificationPreferences`        | 🔄 To be added |
| Activity Logs                   | `/v3/activity`                       | 🔄 To be added |
| Partner API                     | `/v2/managedCompanies`               | 🔄 To be added |

## 🚀 Usage

### View the API Specification

1. **Using VS Code** with the OpenAPI extension:

   ```bash
   code megaport-api.yaml
   ```

2. **Using Swagger UI** (local):

   ```bash
   docker run -p 8080:8080 -e SWAGGER_JSON=/specs/megaport-api.yaml \
     -v $(pwd):/specs swaggerapi/swagger-ui
   ```

   Then open: http://localhost:8080

3. **Using Swagger Editor** (online):
   - Go to https://editor.swagger.io/
   - Copy and paste the content of `megaport-api.yaml`

### Generate API Client

```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate TypeScript client
openapi-generator-cli generate -i specs/megaport-api.yaml \
  -g typescript-axios -o generated/typescript-client

# Generate Python client
openapi-generator-cli generate -i specs/megaport-api.yaml \
  -g python -o generated/python-client
```

## 📝 Examples from Official Documentation

### 1. Login (v3)

```bash
curl --location 'https://api-staging.megaport.com/v3/login' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'username=megaport.newuser@abcd.com' \
  --data-urlencode 'password=Dfjhgedcifk@!23'
```

**Response:**

```json
{
  "message": "Login successfully",
  "terms": "This data is subject to the Acceptable Use Policy...",
  "data": {
    "username": "megaport.newuser@abcd.com",
    "companyUid": "bec27ded-29fb-43dd-8df8-894eb5ca1e98",
    "oAuthToken": {
      "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9...",
      "tokenType": "Bearer",
      "expiresIn": 1000
    }
  }
}
```

### 2. List Company Users

```bash
curl --location 'https://api-staging.megaport.com/v2/employment' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <token>'
```

**Response:**

```json
{
  "message": "Found Employments for Company 1153",
  "terms": "This data is subject to the Acceptable Use Policy...",
  "data": [
    {
      "email": "kate.peters@example.com",
      "employmentId": 51193,
      "firstName": "Kate",
      "lastName": "Peters",
      "position": "Company Admin",
      "securityRoles": ["companyAdmin"],
      "mfaEnabled": false,
      "invitationPending": false
    }
  ]
}
```

### 3. Reset MFA

```bash
curl --location --request PUT 'https://api-staging.megaport.com/v2/employee/45115/mfa' \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <token>' \
  --data '{
    "totpSecret": "G4C3S6MBH2HSF2EV",
    "totpCode": "123456"
  }'
```

## 🎨 Best Practices for Extension

When adding new endpoints to this specification, follow these guidelines:

### 1. **Create Separate Path Files**

```yaml
# specs/paths/products.yaml
v2-products:
  get:
    tags:
      - Product Details
    summary: List All Products
    description: Returns a list of all products for the company
    operationId: listProducts
    # ... rest of definition
```

### 2. **Create Reusable Schemas**

```yaml
# specs/components/schemas/Product.yaml
type: object
description: Megaport product/service
properties:
  productUid:
    type: string
    format: uuid
  productName:
    type: string
  productType:
    type: string
    enum: [MEGAPORT, VXC, MCR, MVE, IX]
# ... rest of properties
```

### 3. **Reference Schemas in Paths**

```yaml
responses:
  "200":
    description: Successfully retrieved products
    content:
      application/json:
        schema:
          type: object
          properties:
            message:
              type: string
            data:
              type: array
              items:
                $ref: "../components/schemas/Product.yaml"
```

### 4. **Use Common Response Patterns**

All Megaport API responses follow this pattern:

```yaml
{
  "message": "string",
  "terms": "This data is subject to the Acceptable Use Policy...",
  "data": {}, # or []
}
```

### 5. **Document HTTP Status Codes**

Megaport API uses standard HTTP codes:

- `200` - OK (Success)
- `400` - Bad Request (Invalid parameters)
- `401` - Unauthorized (Missing/invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Server Error
- `503` - Service Unavailable

## 🔐 Authentication

The API uses JWT Bearer tokens obtained from the `/v3/login` endpoint:

1. **Login** to get access token
2. **Include token** in all subsequent requests:
   ```
   Authorization: Bearer <accessToken>
   ```

### Example:

```typescript
// 1. Login
const loginResponse = await fetch("https://api-staging.megaport.com/v3/login", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: "username=user@example.com&password=pass123",
});
const { data } = await loginResponse.json();
const token = data.oAuthToken.accessToken;

// 2. Use token for authenticated requests
const users = await fetch("https://api-staging.megaport.com/v2/employment", {
  headers: { Authorization: `Bearer ${token}` },
});
```

## 🌍 Environments

| Environment    | URL                              | Purpose                                    |
| -------------- | -------------------------------- | ------------------------------------------ |
| **Production** | https://api.megaport.com         | Live services (billable)                   |
| **Staging**    | https://api-staging.megaport.com | Testing (reset every 24 hours, no billing) |

## 📚 Additional Resources

- **Official Documentation**: https://dev.megaport.com/
- **Main Docs**: https://docs.megaport.com/
- **API v2 FAQs**: https://docs.megaport.com/troubleshooting/api-v2-faq/
- **Account Setup**: https://docs.megaport.com/setting-up/

## 🔄 Version History

### Current Implementation (v1.0.0)

- ✅ Authentication endpoints (`/v3/login`)
- ✅ User management (`/v2/employment`)
- ✅ MFA operations (`/v2/employee/{id}/mfa`)
- ✅ Standard response/error schemas
- ✅ Security schemes (Bearer Auth)

### Planned Extensions

- 🔄 Locations API (`/v3/locations`)
- 🔄 Service ordering (`/v3/networkdesign/*`)
- 🔄 Product management (Ports, VXC, MCR, MVE, IX)
- 🔄 Cloud connectivity (AWS, Azure, Google, Oracle)
- 🔄 Pricing and invoicing
- 🔄 Maintenance and status endpoints

## 📋 Release Notes Summary

Key API changes from official documentation:

### November 2025

- Added `createDate`, `lastUpdateDate`, `lastLoginDate` to employment endpoints

### October 2025

- New endpoint: `GET /v3/products/mcrs/{productUid}/ipsec`
- Added `invitationPending` field to `/v2/employee`

### September 2025

- Deprecated `/v2/locations` in favor of `/v3/locations`
- Invoice APIs updated to v3

### April 2025

- Added `ipMtu` field for jumbo frame support on MCR
- New MCR packet filter endpoints

### March 2025

- Added `mveImageId` parameter to `/v3/locations`
- Added `mcrSpeedMbps` field

## 🤝 Contributing

When extending this specification:

1. Follow the existing file structure
2. Use the official Megaport API documentation as the source of truth
3. Include examples from the official docs
4. Document all required and optional fields
5. Add appropriate descriptions and constraints
6. Update this README with new endpoints added

## ⚠️ Important Notes

- The `/v2/login` API is **deprecated** - use `/v3/login`
- Many v2 endpoints are being replaced with v3 versions
- Staging environment is reset every 24 hours
- All responses include the `terms` field with Acceptable Use Policy
- MFA cannot be disabled if globally enforced by Company Admin

---

**Need Help?** Contact Megaport Tech Pubs at techpubs@megaport.com
