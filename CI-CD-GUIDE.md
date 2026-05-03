# Complete CI/CD Guide for Beginners

## What is CI/CD?

**CI (Continuous Integration):**
- Automatically test your code when you push
- Catch bugs before they reach production
- Ensure code quality

**CD (Continuous Deployment):**
- Automatically deploy after tests pass
- Faster releases
- Less manual work

## Quick Start (5 minutes)

### Step 1: Enable GitHub Actions
```bash
# Your workflows are already in .github/workflows/
# Just push to GitHub!
git add .github/
git commit -m "Add CI/CD"
git push
```

### Step 2: Check Results
1. Go to your GitHub repo
2. Click "Actions" tab
3. Watch your pipeline run! 🎉

## YML File Basics

### What is YML?
- Configuration file format
- Uses indentation (like Python)
- Human-readable

### Basic Syntax

```yaml
# Comments start with #

# Key-value pairs
name: My Pipeline
version: 1.0

# Lists (arrays)
branches:
  - main
  - develop

# Nested objects
env:
  NODE_VERSION: '18'
  PORT: 3000

# Multi-line strings
script: |
  echo "Line 1"
  echo "Line 2"
```

### Common Mistakes

❌ **Wrong:**
```yaml
name:My Pipeline    # Missing space after colon
  steps:            # Wrong indentation
- name: Test        # Inconsistent indentation
```

✅ **Correct:**
```yaml
name: My Pipeline   # Space after colon
steps:              # Consistent 2-space indent
  - name: Test      # Aligned properly
```

## GitHub Actions Workflow Structure

```yaml
name: Pipeline Name              # 1. Name your pipeline

on:                              # 2. When to run
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:                             # 3. Environment variables
  NODE_VERSION: '18'

jobs:                            # 4. Jobs to run
  test:                          # Job name
    runs-on: ubuntu-latest       # OS
    
    steps:                       # 5. Steps in the job
      - name: Checkout           # Step name
        uses: actions/checkout@v3 # Pre-built action
      
      - name: Install
        run: npm install         # Shell command
      
      - name: Test
        run: npm test
```

## Common GitHub Actions

### 1. Checkout Code
```yaml
- uses: actions/checkout@v3
```

### 2. Setup Node.js
```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '18'
```

### 3. Cache Dependencies
```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '18'
    cache: 'npm'
```

### 4. Run Commands
```yaml
- name: Install dependencies
  run: npm install

- name: Run tests
  run: npm test
```

### 5. Working Directory
```yaml
- name: Install backend
  working-directory: ./backend
  run: npm install
```

## Workflow Triggers

### On Push
```yaml
on:
  push:
    branches: [ main, develop ]
```

### On Pull Request
```yaml
on:
  pull_request:
    branches: [ main ]
```

### On Schedule (Cron)
```yaml
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

### Manual Trigger
```yaml
on:
  workflow_dispatch:  # Run manually from GitHub UI
```

### Multiple Triggers
```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
```

## Job Dependencies

### Run Jobs in Parallel
```yaml
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps: [...]
  
  test-frontend:
    runs-on: ubuntu-latest
    steps: [...]
```

### Run Jobs Sequentially
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [...]
  
  deploy:
    needs: test  # Wait for test to finish
    runs-on: ubuntu-latest
    steps: [...]
```

## Conditional Execution

### Run Only on Main Branch
```yaml
deploy:
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps: [...]
```

### Run Only on Success
```yaml
notify:
  needs: test
  if: success()
  runs-on: ubuntu-latest
  steps: [...]
```

### Run Only on Failure
```yaml
notify:
  needs: test
  if: failure()
  runs-on: ubuntu-latest
  steps: [...]
```

## Using Secrets

### Add Secrets in GitHub
1. Repo Settings → Secrets and variables → Actions
2. New repository secret
3. Add: `MONGODB_URI`, `JWT_SECRET`, etc.

### Use in Workflow
```yaml
steps:
  - name: Deploy
    env:
      MONGODB_URI: ${{ secrets.MONGODB_URI }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
    run: npm run deploy
```

## Environment Variables

### Workflow Level
```yaml
env:
  NODE_VERSION: '18'
  
jobs:
  test:
    steps:
      - run: echo $NODE_VERSION
```

### Job Level
```yaml
jobs:
  test:
    env:
      DATABASE: test_db
    steps:
      - run: echo $DATABASE
```

### Step Level
```yaml
steps:
  - name: Deploy
    env:
      PORT: 3000
    run: npm start
```

## Matrix Strategy (Test Multiple Versions)

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

## Artifacts (Save Build Files)

```yaml
steps:
  - name: Build
    run: npm run build
  
  - name: Upload artifacts
    uses: actions/upload-artifact@v3
    with:
      name: build-files
      path: dist/
```

## Caching Dependencies

```yaml
steps:
  - uses: actions/cache@v3
    with:
      path: ~/.npm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
  
  - run: npm install
```

## Real-World Examples

### Example 1: Simple Test Pipeline
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### Example 2: Build and Deploy
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Example 3: Monorepo (Your Project)
```yaml
name: Monorepo CI

on: [push]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - working-directory: ./backend
        run: |
          npm install
          npm test
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - working-directory: ./frontend/tinyurl-frontend
        run: |
          npm install
          npm run build
```

## Debugging Workflows

### Enable Debug Logging
Add these secrets in GitHub:
- `ACTIONS_STEP_DEBUG` = `true`
- `ACTIONS_RUNNER_DEBUG` = `true`

### View Logs
1. Go to Actions tab
2. Click on workflow run
3. Click on job
4. Expand steps to see logs

### Common Issues

**Issue: npm install fails**
```yaml
# Solution: Use npm ci instead
- run: npm ci
```

**Issue: Tests fail in CI but work locally**
```yaml
# Solution: Set NODE_ENV
- run: npm test
  env:
    NODE_ENV: test
```

**Issue: Permission denied**
```yaml
# Solution: Add permissions
permissions:
  contents: read
  packages: write
```

## Best Practices

1. **Start Simple** - Use `simple-ci.yml` first
2. **Add Tests** - CI is useless without tests
3. **Use Caching** - Speed up builds
4. **Fail Fast** - Stop on first error
5. **Keep Secrets Safe** - Never commit secrets
6. **Monitor Costs** - GitHub Actions has limits
7. **Document** - Add comments to your YML

## Next Steps

1. ✅ Push your workflows to GitHub
2. ⏳ Add tests to your project
3. ⏳ Configure deployment
4. ⏳ Add notifications (Slack/Discord)
5. ⏳ Monitor and optimize

## Resources

- [GitHub Actions Docs](https://docs.github.com/actions)
- [YAML Syntax](https://yaml.org/)
- [Marketplace](https://github.com/marketplace?type=actions)
- [Awesome Actions](https://github.com/sdras/awesome-actions)

## Your Project Status

✅ CI/CD files created
✅ Simple pipeline ready
✅ Production pipeline ready
⏳ Add tests (next step)
⏳ Configure deployment
⏳ Add monitoring

**You're ready to go! Just push to GitHub and watch the magic happen! 🚀**
