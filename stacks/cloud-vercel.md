# vercel

Vercel is a managed deployment platform optimized for frontend frameworks,
static sites, and lightweight edge or serverless functions. It owns the git →
build → preview → production pipeline so your team rarely thinks about
infrastructure.

## when to use

- Next.js applications: Vercel wrote the framework and the integration is
  first-class, including ISR, App Router, middleware, and image optimization.
- Static sites and JAMstack: build output is served from a global CDN with
  zero configuration.
- Preview deployments: every branch or pull request gets a unique URL with its
  own env scope. This is one of Vercel's strongest practical features.
- Light JS/TS API routes: simple CRUD or proxy functions that finish in well
  under 10 seconds and do not hold persistent connections.
- Teams that want zero-ops frontend delivery and are willing to pay the premium
  for that abstraction.

## when not to use

- Long-running worker processes: the serverless execution model terminates
  functions after the platform timeout. BullMQ queues, cron processors that run
  for minutes, or any "always-on" worker thread will not work here. Services
  with persistent worker processes do not fit Vercel's model; they belong on
  Railway, Fly, or a container platform.
- Heavy stateful compute: the filesystem is ephemeral and not shared across
  function instances.
- Large media processing: no persistent disk, limited memory, and metered
  egress make video transcoding or batch image pipelines expensive and fragile.
- WebSocket servers: serverless functions do not hold open connections. Use a
  stateful platform or a managed WebSocket service.
- Cost-sensitive high-volume APIs: serverless invocation billing adds up
  quickly; a container on Railway or Fly is often cheaper at consistent load.

## what it ships well

- Atomic deploys with instant rollback to any prior deployment hash.
- Global CDN for static assets with automatic cache invalidation on deploy.
- Integrated image optimization (Next.js `<Image>`).
- Preview environments per branch — each with isolated env vars.
- Edge middleware for auth, redirects, A/B flags at the network edge.
- Managed TLS, custom domains, and DNS in the dashboard.
- Zero-config monorepo support via project root detection.

## stack fit

| Stack | Fit | Notes |
|---|---|---|
| Next.js | Excellent | Native platform; all Next.js features supported. |
| Fastify | Partial | Works as HTTP API via `@vercel/node` adapter; no workers or keep-alive. |
| NestJS | Possible | Functions adapter exists; not idiomatic; cold-start is heavy. |
| FastAPI | Poor | Python functions supported but worker model and cold starts make it awkward. |
| Go-Gin | Poor | Go runtime supported for functions; misses the operational model of Go services. |

Use Vercel for Next.js. Use it for other stacks only when the workload is
purely stateless HTTP with short response times.

## env config pattern

Env vars are managed in three scopes: Production, Preview, and Development.

- Set vars in the Vercel dashboard under Project → Settings → Environment Variables.
- Pull all vars to a local `.env.local` file with `vercel env pull`.
- Sensitive values (API keys, secrets) go into the dashboard only; they are
  never committed.
- Preview branches inherit the Preview scope automatically; override specific
  vars per branch when needed.
- Prefix public vars with `NEXT_PUBLIC_` to expose them to the browser bundle;
  all other vars stay server-side.

See `../standards/security-standards.md` for the general rule on secret
handling and the prohibition on committing env files.

## deployment shape

Connecting a git repository to a Vercel project creates a webhook. On every
push, Vercel clones the repo at that commit, runs the configured build command
(typically `next build`), produces an immutable deployment artifact, promotes
it to the preview URL (for non-default branches) or swaps it atomically onto
the production domain (for the default branch). The previous deployment remains
accessible by its unique URL, so rollback is a one-click operation. Build logs,
function logs, and edge-middleware logs are streamed in the dashboard.

## cost shape

- Hobby plan: free for personal projects; 10-second serverless function timeout;
  100 GB-hours function execution per month; limited team features.
- Pro plan: $20/month per member; 15-second timeout (some function types allow
  up to 300s on Enterprise); more generous function execution budget.
- Pricing inflects on: function execution hours, bandwidth, image optimization
  requests, and seat count.
- Image optimization egress is metered separately and surprises teams who serve
  many large images.
- Edge Function invocations have their own tier; review the pricing page before
  relying on middleware at scale.

## observability

Built-in: real-time function logs, build logs, deployment history, and a basic
runtime dashboard showing invocation counts and duration.

Gaps: no built-in distributed tracing, no custom metrics, no persistent log
storage beyond a short rolling window. For production observability wire in an
external provider (Datadog, Axiom, Sentry, or a log drain endpoint).

See `../standards/logging-observability.md` for the logging standards that apply
regardless of platform.

## gotchas

1. **Serverless payload limit**: request and response bodies are limited to
   4.5 MB. Streaming large files through a function fails silently or returns
   a generic 413.
2. **10-second timeout on Hobby**: API routes that call slow third-party
   services or run DB migrations will be killed mid-flight on the free plan.
3. **Cold starts on infrequently called functions**: a function not invoked for
   several minutes re-provisions. This adds 200 ms–2 s of latency on the first
   request after idle.
4. **Ephemeral filesystem**: writes to `/tmp` are local to one function
   invocation and not shared. Any pattern that assumes a writable shared disk
   will break.
5. **Image optimization egress billing**: every unique (src, width, quality)
   combination is optimized and cached, but the egress for those cached images
   is still metered. High-traffic image-heavy sites should evaluate whether the
   built-in optimizer is cheaper than a dedicated CDN.
6. **No persistent worker model**: there is no way to run a background job loop,
   a message-queue consumer, or a scheduled long-running task on Vercel.
   Model those workloads elsewhere and call Vercel-hosted endpoints from them.

## see also

- `cloud-railway.md` — preferred home for long-running workers and Postgres add-ons
- `cloud-fly.md` — container-first global deployment
- `cloud-cloudflare.md` — edge-native Workers and Pages alternative
- `../stacks/nextjs.md` — Next.js stack profile
- `../stacks/fastify.md` — Fastify stack profile
- `../standards/security-standards.md` — secret and env-var handling rules
- `../standards/logging-observability.md` — observability standards
