# API Testing Project Setup Guide

This project contains comprehensive API tests for the `/v2/locations` endpoint using Playwright Test framework with TypeScript, plus k6 performance testing with Grafana visualization.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Docker & Docker Compose** - For Grafana/InfluxDB setup
- **k6** - [Download here](https://k6.io/docs/get-started/installation/)
- A code editor like **VS Code**

## 📊 Performance Testing with Grafana

This project includes a complete k6 + Grafana + InfluxDB stack for load testing visualization.

### Quick Start

```bash
# Start Grafana and InfluxDB
docker-compose up -d

# Run k6 test with Grafana visualization
k6 run --out influxdb=http://localhost:8086/k6 k6/smoke.test1.js

# View results at http://localhost:3000 (admin/admin)
```

For detailed setup instructions, see [GRAFANA_SETUP.md](GRAFANA_SETUP.md)

## Quick Start

### 1. Create a New Project Folder

```bash
mkdir api-testing-project
cd api-testing-project
```

### 2. Initialize Node.js Project

```bash
npm init -y
```

This creates a `package.json` file with default settings.

### 3. Install Core Dependencies

#### Install Playwright Test Framework

```bash
npm install --save-dev @playwright/test
```

#### Install Playwright Browsers (optional, for UI testing)

```bash
npx playwright install
```

#### Install TypeScript

```bash
npm install --save-dev typescript
npm install --save-dev @types/node
```

#### Install AJV for JSON Schema Validation

```bash
npm install --save-dev ajv ajv-formats
```

### 4. Initialize TypeScript Configuration

```bash
npx tsc --init
```

Update `tsconfig.json` with recommended settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "types": ["node", "@playwright/test"]
  }
}
```

### 5. Create Playwright Configuration

Create `playwright.config.ts`:

```bash
npx playwright test --config
```

Or manually create the file with your desired configuration.

### 6. Project Structure Setup

Create the following directory structure:

```bash
mkdir -p tests/api
mkdir -p modules/locations modules/data
mkdir -p utils
mkdir -p fixtures/mocks
```

### 7. Update package.json Scripts

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "npx playwright test",
    "test:ui": "npx playwright test --ui",
    "test:headed": "npx playwright test --headed",
    "test:api": "npx playwright test tests/api",
    "test:smoke": "npx playwright test --grep @smoke",
    "test:ci": "npx playwright test --grep @ci",
    "report": "npx playwright show-report",
    "report:html": "npx playwright show-report",
    "lint": "npx eslint .",
    "type-check": "npx tsc --noEmit"
  }
}
```

## Complete Dependency Installation

If you're cloning this existing project, install all dependencies at once:

```bash
npm install
```

This will install all dependencies listed in `package.json`.

## Environment Configuration

### 1. Set Base URL

You can configure the API base URL in `playwright.config.ts`:

```typescript
use: {
  baseURL: 'https://api.example.com', // Replace with your API endpoint
}
```

### 2. Environment Variables (Optional)

Create a `.env` file for sensitive data:

```bash
API_BASE_URL=https://api.example.com
API_KEY=your-api-key-here
```

Install dotenv if using environment variables:

```bash
npm install --save-dev dotenv
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm run test:api
```

### Run Tests by Tag

```bash
npm run test:smoke
npm run test:ci
npx playwright test --grep @performance
```

### Run Tests in UI Mode (Interactive)

```bash
npm run test:ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:headed
```

### View Test Report

```bash
npm run report
```

## Project Dependencies

### Core Dependencies

- **@playwright/test**: Testing framework for API and E2E testing
- **typescript**: TypeScript language support
- **ajv**: JSON Schema validator
- **ajv-formats**: Additional format validators for AJV (date, email, etc.)

### Development Dependencies

- **@types/node**: TypeScript type definitions for Node.js

## Additional Tools (Optional)

### ESLint for Code Quality

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx eslint --init
```

### Prettier for Code Formatting

```bash
npm install --save-dev prettier
echo '{"semi": true, "singleQuote": false, "tabWidth": 2}' > .prettierrc
```

### Husky for Git Hooks

```bash
npm install --save-dev husky
npx husky init
```

## Troubleshooting

### Module Not Found Errors

```bash
npm install
npx playwright install
```

### TypeScript Compilation Errors

```bash
npm run type-check
```

### Port Already in Use

Check if another process is using the port and kill it, or change the port in configuration.

### Permission Errors (Linux/Mac)

```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

## Best Practices

1. **Keep dependencies up to date**: Run `npm outdated` regularly
2. **Use TypeScript strict mode**: Catches errors early
3. **Tag your tests**: Use tags like `@smoke`, `@ci`, `@api` for selective execution
4. **Review test reports**: Check `playwright-report/` after test runs
5. **Use environment variables**: Don't commit sensitive data

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright API Testing Guide](https://playwright.dev/docs/api-testing)
- [AJV JSON Schema Documentation](https://ajv.js.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Support

For issues or questions:

1. Check the Playwright documentation
2. Review test reports in `playwright-report/`
3. Check console output for detailed error messages

## License

This project is for internal use and testing purposes.
