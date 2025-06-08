
# Deployment Guide - Autheo Trust Bridge

## Overview

This guide covers the deployment process for the Autheo Trust Bridge application across different environments.

## Prerequisites

### System Requirements
- **Node.js**: v18 or higher
- **npm/bun**: Latest stable version
- **Git**: For version control
- **Domain**: Custom domain for production deployment

### Environment Setup
1. **Development**: Local development environment
2. **Staging**: Pre-production testing environment
3. **Production**: Live production environment

## Environment Configuration

### Environment Variables

Create the following environment files:

#### `.env.development`
```
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=your-development-supabase-url
VITE_SUPABASE_ANON_KEY=your-development-supabase-key
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MONITORING=true
```

#### `.env.production`
```
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-key
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MONITORING=true
VITE_SENTRY_DSN=your-sentry-dsn
```

### Build Configuration

#### Vite Production Build
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview
```

#### Build Optimization
- **Code splitting**: Automatic route-based splitting
- **Tree shaking**: Removes unused code
- **Asset optimization**: Compresses images and fonts
- **Bundle analysis**: Use `npm run analyze` to inspect bundle size

## Deployment Options

### 1. Lovable Platform Deployment

#### Quick Deployment
1. Click the "Publish" button in Lovable editor
2. Choose deployment options
3. Configure custom domain (requires paid plan)
4. Monitor deployment status

#### Custom Domain Setup
1. Navigate to Project > Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable SSL certificate

### 2. Vercel Deployment

#### Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Configure environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

#### Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "VITE_APP_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Netlify Deployment

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy site
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 4. AWS S3 + CloudFront

#### S3 Bucket Setup
```bash
# Create S3 bucket
aws s3 mb s3://autheo-trust-bridge-prod

# Configure bucket for static website hosting
aws s3 website s3://autheo-trust-bridge-prod \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync dist/ s3://autheo-trust-bridge-prod --delete
```

#### CloudFront Distribution
1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Configure custom error pages (404 → index.html)
4. Enable HTTPS and HTTP/2
5. Set up custom domain and SSL certificate

## Database Setup

### Supabase Configuration

#### Development Database
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create core tables
-- (Refer to Supabase schema in project)
```

#### Production Database
1. Create production Supabase project
2. Run migration scripts
3. Configure Row Level Security (RLS)
4. Set up database backups
5. Configure monitoring and alerting

### Database Migration
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Run migrations
supabase db push

# Generate types
supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

## Monitoring & Analytics

### Error Monitoring (Sentry)
```bash
# Install Sentry
npm install @sentry/react @sentry/tracing

# Configure in main.tsx
```

### Performance Monitoring
- **Web Vitals**: Automated tracking via built-in system
- **Bundle analyzer**: Regular bundle size monitoring
- **Uptime monitoring**: External service monitoring
- **Database performance**: Supabase built-in monitoring

### Health Checks
Create health check endpoints:
- `/health` - Basic health status
- `/health/detailed` - Comprehensive system status
- `/version` - Application version information

## Security Configuration

### Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://your-supabase-url.supabase.co;
">
```

### HTTPS Configuration
- Force HTTPS redirects
- HSTS headers
- Secure cookies
- SSL certificate management

### Authentication Security
- Secure session management
- Token refresh strategies
- Rate limiting
- CSRF protection

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Enable gzip compression
# Configure in your hosting provider
```

### CDN Configuration
- Static asset caching
- Image optimization
- Geographic distribution
- Cache invalidation strategies

### Database Optimization
- Connection pooling
- Query optimization
- Index management
- Backup strategies

## Backup & Recovery

### Code Repository
- GitHub repository with branch protection
- Automated backups
- Disaster recovery procedures

### Database Backups
- Daily automated backups
- Point-in-time recovery
- Cross-region replication
- Backup testing procedures

### Application State
- Configuration backup
- Environment variable management
- Secret management

## Monitoring & Maintenance

### Production Monitoring
- Application performance monitoring
- Error rate tracking
- User experience monitoring
- Infrastructure monitoring

### Maintenance Procedures
- Regular security updates
- Dependency updates
- Performance optimization
- Capacity planning

### Incident Response
- Alerting procedures
- Escalation processes
- Communication protocols
- Post-incident reviews

## Troubleshooting

### Common Issues
1. **Build failures**: Check environment variables and dependencies
2. **Routing issues**: Verify SPA configuration
3. **API connectivity**: Check CORS and authentication
4. **Performance issues**: Analyze bundle size and network requests

### Debug Tools
- Browser developer tools
- Network monitoring
- Performance profiler
- Error tracking

### Support Contacts
- Technical lead: [contact information]
- DevOps team: [contact information]
- Supabase support: [support channels]

This deployment guide ensures consistent, secure, and reliable deployments across all environments.
