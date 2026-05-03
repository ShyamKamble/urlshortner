# CI/CD Workflows Guide

## Files in this folder:

### 1. `simple-ci.yml` - Beginner Friendly
**Use this if:** You're just starting with CI/CD
**What it does:**
- Runs on every push to main
- Installs dependencies
- Builds the project
- Basic validation

**To use:** Just push to GitHub, it runs automatically!

### 2. `ci-cd.yml` - Production Ready
**Use this if:** You want a complete CI/CD pipeline
**What it does:**
- Tests backend and frontend separately
- Runs security audits
- Builds production bundles
- Deploys automatically (when configured)
- Sends notifications on failure

**To use:** 
1. Add tests to your project
2. Configure deployment secrets
3. Push to GitHub

## How to Enable

1. **Commit these files:**
   ```bash
   git add .github/
   git commit -m "Add CI/CD pipeline"
   git push
   ```

2. **Check GitHub Actions:**
   - Go to your repo on GitHub
   - Click "Actions" tab
   - See your workflows running!

## YML File Structure Explained

```yaml
name: My Pipeline          # Name shown in GitHub

on:                        # When to run
  push:                    # On git push
    branches: [ main ]     # Only on main branch

jobs:                      # What to do
  test:                    # Job name
    runs-on: ubuntu-latest # OS to use
    
    steps:                 # Individual tasks
      - uses: actions/checkout@v3  # Get code
      - run: npm install           # Run command
```

## Common YML Syntax

### Basic Structure
```yaml
key: value                 # Simple value
key: "value with spaces"   # Quoted string
key: 123                   # Number
key: true                  # Boolean
```

### Lists
```yaml
branches:
  - main
  - develop
  - feature/*
```

### Objects
```yaml
env:
  NODE_VERSION: '18'
  PORT: 3000
```

### Multi-line Commands
```yaml
run: |
  echo "Line 1"
  echo "Line 2"
  npm install
```

## Adding Secrets

For deployment, add secrets in GitHub:
1. Go to repo Settings
2. Secrets and variables → Actions
3. New repository secret
4. Add: `MONGODB_URI`, `JWT_SECRET`, etc.

Use in workflow:
```yaml
env:
  MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

## Next Steps

1. **Start with `simple-ci.yml`** - Delete or disable `ci-cd.yml`
2. **Add tests** to your project
3. **Upgrade to `ci-cd.yml`** when ready
4. **Add deployment** configuration

## Troubleshooting

**Pipeline fails?**
- Check the "Actions" tab on GitHub
- Click on the failed run
- Read the error logs
- Fix the issue and push again

**Need help?**
- GitHub Actions docs: https://docs.github.com/actions
- YAML syntax: https://yaml.org/
