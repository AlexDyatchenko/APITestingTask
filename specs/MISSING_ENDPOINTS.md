# Missing Endpoints - Dynamic Content Note

## ⚠️ Important: Website Has Dynamic Content

The Megaport API documentation website (https://dev.megaport.com/) uses **dynamic/client-side rendering**, which means not all endpoints are visible in a simple webpage fetch. The navigation menu shows many more sections than what can be scraped directly.

## ✅ Endpoints Already Implemented

### Authentication & User Management
- ✅ `POST /v3/login` - Login with username and password
- ✅ `GET /v2/employment` - List company users
- ✅ `POST /v2/employee/password` - Change password (Added based on reference)
- ✅ `GET /v2/totp/qrcode` - Generate TOTP QR code for MFA (Added based on MFA reset docs)

### Multi-Factor Authentication (MFA)
- ✅ `PUT /v2/employee/{employeeId}/mfa` - Reset person MFA
- ✅ `DELETE /v2/employee/{employeeId}/mfa` - Disable person MFA
- ✅ `DELETE /v2/employee/{employeeId}/mfa/admin` - Admin reset user MFA

## 🔍 How to Find Missing Endpoints

Based on the navigation structure visible on the website, here are the major sections that likely contain additional endpoints:

### 1. **Megaport Authentication - API Keys**
Possible endpoints:
- `POST /v2/apikey` - Create API key
- `GET /v2/apikeys` - List API keys
- `DELETE /v2/apikey/{id}` - Delete API key
- `PUT /v2/apikey/{id}` - Update API key

### 2. **Account Setup**
Possible endpoints:
- `POST /v2/signup` - Create new account
- `GET /v2/company` - Get company details
- `PUT /v2/company` - Update company details
- `POST /v2/company/billing` - Set billing information
- Various other account management endpoints

### 3. **User Authentication** (Partially Implemented)
Known from documentation references:
- ✅ `POST /v3/login` - Implemented
- ✅ `POST /v2/employee/password` - Implemented (inferred)
- ✅ `GET /v2/totp/qrcode` - Implemented (referenced in MFA docs)
- `POST /v2/logout` - Likely exists
- `GET /v2/employee/{employeeId}` - Mentioned in release notes
- `POST /v2/employee` - Create employee
- `PUT /v2/employee/{employeeId}` - Update employee
- `DELETE /v2/employee/{employeeId}` - Delete employee

### 4. **Locations**
Known from release notes:
- `GET /v3/locations` - Get data center locations (v3, current)
- `GET /v2/locations` - Get locations (v2, deprecated July 2025)

### 5. **Ordering Services**
Known from release notes:
- `POST /v3/networkdesign/validate` - Validate service order (v3, current)
- `POST /v3/networkdesign/buy` - Purchase services (v3, current)
- `POST /v2/networkdesign/validate` - Deprecated
- `POST /v2/networkdesign/buy` - Deprecated

### 6. **Ports (Megaport)**
- `GET /v2/product/megaport` - List ports
- `POST /v2/product/megaport` - Create port
- `PUT /v2/product/megaport/{uid}` - Update port
- `DELETE /v2/product/megaport/{uid}` - Delete port

### 7. **Connections (VXC - Virtual Cross Connect)**
Known from release notes:
- `GET /v2/product/vxc/{uid}` - Get VXC details
- `PUT /v3/product/vxc/{uid}` - Update VXC (v3, current)
- `PUT /v2/product/vxc/{uid}` - Update VXC (v2, deprecated)
- `DELETE /v2/product/vxc/{uid}` - Delete VXC

### 8. **Cloud Connectivity**
Mentioned in release notes:
- `GET /v2/secure/google/{pairing_key}` - Google Cloud connection
- `GET /v2/secure/awshc` - AWS Hosted Connection ports
- AWS, Azure, Oracle, IBM Cloud endpoints

### 9. **MCR (Megaport Cloud Router)**
Known from release notes:
- `GET /v2/product/mcr2/{productUid}` - Get MCR details
- `POST /v2/product/mcr2` - Create MCR
- `PUT /v2/product/mcr2/{productUid}` - Update MCR
- `GET /v3/products/mcrs/{productUid}/ipsec` - Get IPsec data (October 2025)

**MCR Packet Filters** (April 2025):
- `GET /v2/product/mcr2/{productUid}/packetFilter/{packetFilterId}` - Get packet filter
- `GET /v2/product/mcr2/{productUid}/packetFilters` - List packet filters
- `POST /v2/product/mcr2/{productUid}/packetFilter` - Create packet filter
- `PUT /v2/product/mcr2/{productUid}/packetFilter/{packetFilterId}` - Update packet filter
- `DELETE /v2/product/mcr2/{productUid}/packetFilter/{packetFilterId}` - Delete packet filter

### 10. **MVE (Megaport Virtual Edge)**
Known from release notes:
- `GET /v4/product/mve/images` - Get MVE images (v4, current - August 2024)
- `GET /v3/product/mve/images` - Deprecated
- `GET /v2/product/mve/variants` - Get available MVE sizes
- Various MVE vendor-specific endpoints (VMware, Fortinet, Cisco, Versa, Aruba)

### 11. **IX (Internet Exchange)**
- `GET /v2/product/ix/{uid}` - Get IX details
- `POST /v2/product/ix` - Create IX connection
- `PUT /v2/product/ix/{uid}` - Update IX
- `DELETE /v2/product/ix/{uid}` - Delete IX

### 12. **Product Details**
Known from release notes:
- `GET /v2/product/{uid}` - Get product details by UID
- `GET /v2/products` - List all products
- `POST /v2/product/{productUid}/action/{action}` - Product actions (v2, deprecated)

### 13. **Service Status**
- Various service status endpoints

### 14. **Maintenance and Outage Events**
Known from release notes (June 2024):
- `GET /ens/v1/status/outage` - Monitor outage events
- `GET /ens/v1/status/maintenance` - Monitor maintenance events

### 15. **MCR Looking Glass**
Known from release notes (August 2023):
- MCR Looking Glass endpoints for IP, BGP, neighbor routes
- Async mode endpoints

### 16. **Email Notifications**
Known from release notes:
- `GET /v3/notificationPreferences` - Get notification preferences (v3, February 2025)
- `PUT /v3/notificationPreferences` - Update notification preferences
- `GET /v2/notificationPreferences` - Deprecated

### 17. **Pricing**
Known from release notes:
- `GET /v3/pricebook/megaport` - Get port pricing
- `GET /v3/pricebook/vxc` - Get VXC pricing (v3, current)
- `GET /v3/pricebook/mcr` - Get MCR pricing
- `GET /v3/pricebook/mve` - Get MVE pricing
- `GET /v2/pricebook/mve` - Deprecated
- `GET /v2/pricebook/vxc` - Deprecated

### 18. **Invoices**
Known from release notes (November 2024, v3):
- `GET /v3/company/{companyUid}/invoice/supplierId/{supplierId}` - Get invoices by supplier
- `GET /v3/company/{companyUid}/invoice/{invoiceId}` - Get invoice by ID
- `GET /v3/company/{companyUid}/invoice/{invoiceId}/pdf` - Get invoice as PDF
- `GET /v3/company/{companyUid}/invoice/{invoiceId}/csv` - Get invoice as CSV

### 19. **Activity Logs**
Known from release notes (December 2024):
- `GET /v3/activity` - Get activity logs for logged-in user

### 20. **Partner API for Managed Accounts**
Known from release notes:
- `POST /v2/managedCompanies` - Create managed company
- `PUT /v2/managedCompanies` - Update managed company (with resource limits - August 2025)
- `GET /v2/managedCompanies` - List managed companies

### 21. **Service Inventory Report**
Known from release notes (March 2024):
- `GET /v2/secure/inventory/companies/{companyUid}/services` - Get service inventory (JSON)
- `GET /v2/secure/inventory/companies/{companyUid}/services/csv` - Get service inventory (CSV)

### 22. **Resource Tagging**
Known from release notes (August 2024):
- Endpoints for creating, modifying, and deleting resource tags

### 23. **Telemetry / Metrics**
Known from release notes:
- Service telemetry endpoints
- CSV download support (July 2024)

## 📝 Recommendations

### Option 1: Manual Documentation Review
Visit the actual website at https://dev.megaport.com/ and:
1. Click through each section in the left navigation
2. Document each endpoint you find
3. Copy the request/response examples
4. Add them to the OpenAPI spec using the same pattern

### Option 2: Use Browser Developer Tools
1. Open https://dev.megaport.com/ in a browser
2. Open Developer Tools (F12)
3. Look at the Network tab or inspect the page source
4. The API documentation might load endpoint data from a JSON file
5. Extract that data and convert it to OpenAPI format

### Option 3: Check for OpenAPI/Swagger Export
1. Many API documentation sites provide an OpenAPI export
2. Look for "Download OpenAPI", "Export", or "Swagger" options
3. Check URLs like:
   - https://dev.megaport.com/openapi.json
   - https://dev.megaport.com/swagger.json
   - https://api.megaport.com/swagger.json

### Option 4: Contact Megaport
Email techpubs@megaport.com and request:
- Complete OpenAPI specification file
- API documentation in machine-readable format

## 🎯 Current Implementation Status

### Completed (7 endpoints)
1. POST /v3/login
2. GET /v2/employment
3. PUT /v2/employee/{employeeId}/mfa
4. DELETE /v2/employee/{employeeId}/mfa
5. DELETE /v2/employee/{employeeId}/mfa/admin
6. POST /v2/employee/password (inferred from docs)
7. GET /v2/totp/qrcode (referenced in MFA reset docs)

### Estimated Remaining: 100+ endpoints
Based on the navigation structure and release notes, there are likely 100+ endpoints across:
- 20+ major categories
- Multiple versions (v2, v3, v4)
- Deprecated and current versions

## ✨ Next Steps

To complete the OpenAPI specification:

1. ✅ **Implemented** - Core authentication and MFA endpoints
2. 🔄 **In Progress** - Add more endpoints as they're discovered
3. ⏳ **TODO** - Systematically go through each section:
   - Account Setup
   - Locations
   - Ordering
   - Products (Ports, VXC, MCR, MVE, IX)
   - Cloud Connectivity
   - Pricing
   - Invoices
   - Notifications
   - Activity Logs
   - Partner API

---

**Last Updated**: January 26, 2026
**Status**: Initial implementation with 7 endpoints
**Source**: https://dev.megaport.com/
