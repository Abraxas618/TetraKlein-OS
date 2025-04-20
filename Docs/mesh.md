# TetraKlein-OS Mesh Documentation

## Overview
TetraKlein-OS Mesh is a modern web interface for the TetraKlein-OS system, built with React, TypeScript, and Vite. This document explains the architecture, development workflow, and deployment process.

## System Architecture

### Development Environment
- **Port**: 8080
- **URL**: `http://localhost:8080`
- **Features**:
  - Hot Module Replacement (HMR)
  - Fast refresh
  - Development error overlay
  - Source maps
  - TypeScript support

### Production Environment
- **Port**: 8080
- **URL**: `http://127.0.0.1:8080`
- **Features**:
  - Optimized builds
  - Minified code
  - Production-ready assets
  - Containerized deployment (Podman)

## Directory Structure
```
Mesh/
├── components/     # Reusable React components
├── pages/         # Page components
├── services/      # API and service integrations
├── hooks/         # Custom React hooks
├── lib/          # Utility functions and libraries
├── public/       # Static assets
└── src/          # Source files
```

## Development Workflow

### 1. Starting Development Server
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The development server runs at `http://localhost:8080` with hot-reloading enabled.

### 2. Building for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### 3. Running in Podman
```bash
# Build and run container
podman build -t tetraklein-mesh .
podman run -p 8080:8080 tetraklein-mesh
```

## Configuration Files

### vite.config.ts
- Configures Vite development server
- Sets up path aliases
- Configures build optimization
- Manages development and production ports

### tsconfig.json
- TypeScript configuration
- Path aliases for imports
- Strict type checking
- Module resolution settings

### package.json
- Project dependencies
- Scripts for development and building
- Version management

## Key Features

### 1. Development Features
- **Hot Module Replacement**: Instant updates without page refresh
- **TypeScript Support**: Type safety and better development experience
- **Path Aliases**: Clean imports using `@components`, `@pages`, etc.
- **ESLint**: Code quality and style enforcement

### 2. Production Optimizations
- **Code Splitting**: Automatic chunk splitting for better performance
- **Tree Shaking**: Removal of unused code
- **Asset Optimization**: Minified and optimized assets
- **Vendor Chunking**: Separate vendor bundles for better caching

### 3. Containerization
- **Podman Support**: Containerized deployment
- **Port Configuration**: Consistent port usage (8080)
- **Environment Isolation**: Separate development and production environments

## Common Tasks

### Adding New Dependencies
```bash
npm install <package-name>
```

### Creating New Components
1. Create file in `components/` directory
2. Use TypeScript and React
3. Import using path aliases:
```typescript
import { Component } from '@components/Component'
```

### Building and Deploying
1. Build the application:
```bash
npm run build
```
2. Deploy to Podman:
```bash
podman build -t tetraklein-mesh .
podman run -p 8080:8080 tetraklein-mesh
```

## Troubleshooting

### Development Server Issues
- **Port in use**: Check if another process is using port 8080
- **Build errors**: Check TypeScript errors and dependencies
- **HMR not working**: Check browser console for errors

### Production Issues
- **Container not starting**: Check Podman logs
- **Build failures**: Check TypeScript and dependency issues
- **Performance issues**: Check bundle size and optimization settings

## Best Practices

1. **Development**:
   - Use TypeScript for all new code
   - Follow component structure
   - Use path aliases for imports
   - Write tests for new features

2. **Building**:
   - Always test production build locally
   - Check bundle size
   - Verify all assets are loading

3. **Deployment**:
   - Use consistent port (8080)
   - Monitor container health
   - Keep dependencies updated

## Support

For issues or questions:
1. Check the TetraKlein-OS documentation
2. Review error messages in development console
3. Check container logs in production
