# railway

Railway is a managed container platform aimed at teams that want a simple
deploy experience without the ceremony of AWS or the limitations of
function-only platforms. It runs long-lived containers, provides Postgres and
Redis as first-class add-ons, and keeps multiple services in one project with
a shared private network.

## when to use

- Long-running services: workers, queue consumers (BullMQ, Sidekiq, Celery),
  scheduled jobs, WebSocket servers, or any process that must stay alive.
- Postgres + Redis add-ons: Railway provisions managed instances in one click
  and injects connection strings as env vars automatically.
- Internal tools and admin services where operational simplicity matters more
  than global edge performance.
- Monorepo deploys where each directory maps to one Railway service; the project
  view shows them all with shared networking.
- Teams migrating off Heroku who want a similar DX at comparable cost.
- Proof-of-concept and staging environments where spin-up speed and add-on
  convenience beat raw cost efficiency.

## when not to use

- Edge or CDN workloads: Railway has no global edge network. All services run
  in a single region (you choose at project creation). Latency-sensitive global
  traffic belongs on Fly or Cloudflare Workers.
- Heavy static asset serving: use a CDN (Cloudflare, Vercel, or S3 + CloudFront)
  in front of Railway for static files. Railway egress is billed per GB.
- Extremely cost-sensitive production at scale: at high memory/CPU usage a
  dedicated VM or ECS Fargate becomes cheaper. Railway's convenience premium
  is real.
- Projects that need multi-region active-active without significant manual work.

## what it ships well

- Nixpacks auto-detection: push a repo, Railway figures out the build (Node,
  Go, Python, Ruby, etc.) without a Dockerfile in most cases.
- Dockerfile support: when Nixpacks isn't enough, bring your own Dockerfile.
- Postgres and Redis add-ons as first-class services with automatic env var
  injection (`DATABASE_URL`, `REDIS_URL`).
- Private networking between services in the same project via internal hostnames.
- Multiple services per project with a shared environment variable namespace
  where useful.
- Deployment history and one-click rollback per service.

## stack fit

| Stack | Fit | Notes |
|---|---|---|
| Go-Gin | Excellent | Compiled binary in a container; minimal resource use; workers fit perfectly. |
| NestJS | Excellent | Long-lived process with queue workers, scheduled tasks, and Postgres fits the model. |
| Fastify | Excellent | HTTP API plus any workers run as separate Railway services in one project. |
| FastAPI | Excellent | Python container with Uvicorn or Gunicorn runs without modification. |
| Next.js | Good | Deploys and runs, but you lose Vercel's preview-deploy DX and image optimization. Use Railway for Next.js only when the app lives alongside backend services in one project and a separate Vercel project is unwanted. |

## env config pattern

- Each Railway service has its own env var panel in the dashboard.
- Shared variables can be promoted to project-level and referenced by multiple
  services.
- Add-on services (Postgres, Redis) inject their connection strings automatically
  into services that reference them.
- Use the Railway CLI (`railway variables`) to export current vars and diff
  against your local `.env`.
- Do not commit `.env` files; treat the Railway dashboard as the source of truth
  for production and staging configs.
- Create separate Railway environments (e.g., `production`, `staging`) per
  project to maintain env isolation.

See `../standards/security-standards.md` for the general rules on secret
handling.

## deployment shape

Connecting a git repository to a Railway service creates a deploy hook. On
push, Railway pulls the repo, detects the build strategy (Nixpacks or
Dockerfile), builds the image, pushes it to the internal registry, and
replaces the running container with the new one. Zero-downtime deploys depend
on a health-check endpoint being configured; without it, Railway does a
kill-and-restart swap. Multiple services in the same project share a private
network and can reach each other by the service's internal hostname without
traversing the public internet.

## cost shape

- No permanent free tier as of 2026. Trial credits are available for new
  accounts.
- Team plan: $20/month base plus usage (CPU-seconds, memory GB-hours, egress GB,
  add-on storage).
- Pricing inflects on: always-on services with high memory, large Postgres
  databases, and egress-heavy workloads.
- Postgres and Redis add-ons bill on storage and included compute; small
  databases are inexpensive.
- Egress (outbound bandwidth) is metered; high-traffic APIs should estimate
  egress volume before committing.

## observability

Built-in: per-service log tail in the dashboard (rolling window), deployment
history, and basic CPU/memory graphs.

Gaps: no distributed tracing, no persistent log archive, no custom metrics
pipeline. For production, stream logs to an external sink via the log drain
feature (supports HTTP endpoints, Datadog, Papertrail, and others).

See `../standards/logging-observability.md` for logging standards and the
expected structured log format.

## gotchas

1. **No built-in CDN**: Railway services respond from a single region. Put
   Cloudflare or another CDN in front for any public-facing traffic that
   benefits from caching or geographic proximity.
2. **Private networking is project-scoped**: service-to-service internal DNS
   only works between services in the same Railway project. Services in
   separate projects must communicate over the public internet.
3. **Postgres backups need explicit config**: the managed Postgres add-on
   provides point-in-time recovery only on higher plans. Enable and test backups
   before treating the add-on as production-grade.
4. **Egress costs accumulate**: outbound bandwidth is billed. Services that
   stream large payloads or proxy media should route those bytes through a CDN
   or object store, not directly from the Railway service.
5. **Preview deploys are limited**: Railway has PR deploy support but it is less
   polished than Vercel's branch-preview model. Budget extra setup time if
   preview environments are a team requirement.
6. **Health-check required for zero-downtime**: without a configured health
   endpoint, deploys kill the old container before the new one is ready,
   producing a brief outage window.

## see also

- `cloud-vercel.md` — Next.js and static sites
- `cloud-fly.md` — multi-region or latency-sensitive workloads
- `cloud-aws-basics.md` — when Railway's scale ceiling is reached
- `../stacks/go.md`, `../stacks/nestjs.md`, `../stacks/fastify.md`, `../stacks/fastapi.md` — stack profiles
- `../stacks/postgres.md`, `../stacks/redis.md` — add-on stack profiles
- `../standards/security-standards.md` — secret and env-var handling rules
- `../standards/logging-observability.md` — observability standards
