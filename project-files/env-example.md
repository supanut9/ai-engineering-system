# .env.example

## Purpose

Documents the environment variables a project expects without exposing secrets.

## Should Exist

Yes, when the project uses environment-based configuration.

## Typical Contents

Recommended conventions:

- one key per line
- placeholder values only
- comments for required and optional meaning
- group related keys together

## Suggested Outline

```dotenv
# Required
APP_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/app

# Optional
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

## Rules

- never include real secrets
- keep names synchronized with actual runtime configuration
- remove dead variables when the application no longer uses them

## Naming

Use `.env.example` as a dotfile.
