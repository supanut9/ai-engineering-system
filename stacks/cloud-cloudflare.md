# cloudflare (workers, pages, r2, d1)

Cloudflare's developer platform is a collection of edge-native primitives:
Workers (JavaScript/Wasm functions at the edge), Pages (static site and
full-stack hosting), R2 (object storage with no egress fees), D1 (SQLite at
the edge), KV (eventually consistent key-value), and Durable Objects
(strongly consistent stateful edge objects). The defining characteristic is
that all compute runs in Cloudflare's global network of 300+ PoPs, not in a
single datacenter.

## when to use

- Edge functions with global reach: Workers execute near the user with
  sub-millisecond cold starts (V8 isolate model, not a VM).
- Object storage with zero egress fees: R2 is a near drop-in for S3; no
  charge for data egress to the internet.
- Static sites and full-stack apps: Pages provides git-push deploys with
  preview URLs; CDN is built in.
- D1 for lightweight relational data co-located with the Worker; KV for
  eventually consistent config or feature flags; Durable Objects for
  strongly consistent coordination (rate limiting, real-time collaboration).

## when not to use

- Long-running stateful processes: Workers have CPU-time limits and no persistent
  filesystem; queue consumers that hold connections for minutes do not fit.
- Arbitrary runtimes: Workers run in a V8 isolate sandbox; no Linux binaries,
  Python, or JVM. Node.js compatibility is partial (see gotchas).
- Teams not comfortable with the edge programming model: Durable Objects and KV
  are genuinely different from traditional databases; budget for the learning curve.

## what it ships well

- Global deployment without region selection; Cloudflare routes to the nearest PoP.
- Isolate cold starts measured in microseconds.
- R2: S3-compatible API, zero egress charges.
- Pages preview deployments per branch.
- Wrangler CLI: unified tool for deploy, secrets, log tail, and local dev.
- D1 + Workers: relational reads co-located with compute.

## stack fit

| Stack | Fit | Notes |
|---|---|---|
| Hono (edge-native) | Excellent | Designed for Workers; minimal overhead; recommended for new Worker APIs. |
| Next.js (Pages) | Good | Cloudflare Pages supports Next.js via the `@cloudflare/next-on-pages` adapter; not all Next.js features are supported. Verify compatibility before committing. |
| Fastify | Poor | Fastify depends on Node.js core modules not fully available in the Worker runtime. Port to Hono or use Fastify on a container platform instead. |
| NestJS | Poor | Same constraints as Fastify; not suited to the isolate model. |
| FastAPI | Poor | Python runtime is not available in Workers. Use a container platform for FastAPI. |
| Go-Gin | Poor | Go can compile to Wasm for Workers but this is experimental; standard Go services belong on Fly or Railway. |

The platform rewards edge-native code; porting traditional frameworks here adds friction without benefit.

## env config pattern

- Workers secrets: `wrangler secret put KEY`. Encrypted at rest; injected into
  the Worker environment at runtime; not visible after being set.
- Workers non-secret config: defined in `wrangler.toml` under `[vars]`.
  Committed to the repo. Do not put secret values here.
- Pages secrets: set in the Pages dashboard under Settings → Environment
  Variables. Scoped to Production or Preview independently.
- Local development: put non-secret vars in `.dev.vars` (not committed).
  Wrangler loads this file automatically during `wrangler dev`.
- Per-environment separation: Wrangler supports named environments in
  `wrangler.toml` (`[env.staging]`, `[env.production]`) each with their own
  vars and route patterns.

See `../standards/security-standards.md` for the general rules on secret
handling and the prohibition on committing secret values.

## deployment shape

For Workers: `wrangler deploy` compiles the Worker script (or runs the build
step), uploads the bundle to Cloudflare's network, and propagates to all PoPs
within seconds. There is no region to choose; the script runs everywhere.

For Pages: pushing to a connected git branch triggers a Pages build pipeline.
The output is deployed to a preview URL (non-default branch) or the production
domain (default branch) with atomic swap and instant rollback.

Both Workers and Pages are stateless by default. State lives in KV, R2, D1,
or Durable Objects — not in the Worker process itself.

## cost shape

- Free tier: 100,000 Worker requests per day, limited KV reads/writes, 10 GB
  R2 storage, 5 GB R2 egress-free reads. Very generous for prototypes and
  low-traffic services.
- Paid plans: $5/month Workers Paid unlocks higher CPU-time limits, more
  invocations, and Cron Triggers. D1 and Durable Objects have their own usage
  tiers.
- R2 egress is free to the internet (this is the headline advantage vs. S3).
  Class A (write) and Class B (read) operations are billed per million above
  the free tier.
- Pricing surprises: Durable Object storage and requests can accumulate faster
  than expected in high-coordination workloads; monitor usage.

## observability

Built-in: `wrangler tail` streams live logs from a deployed Worker; the
dashboard shows request counts, error rates, and CPU time.

Gaps: no persistent log storage, no distributed tracing, no custom metrics
dashboard. Use the Logpush feature to ship logs to an external sink (Datadog,
S3/R2, Splunk). For tracing across multiple Workers, instrument with a
compatible telemetry library.

See `../standards/logging-observability.md` for the expected log format.

## gotchas

1. **CPU-time limits are strict**: Workers are billed by CPU time. Waiting on
   I/O does not count, but heavy computation will hit the limit and be
   terminated. Design Workers to do minimal CPU work.
2. **Node.js compatibility is partial**: the `nodejs_compat` compatibility flag
   enables many Node.js built-ins, but not all. Libraries that depend on
   `fs`, `child_process`, `net`, or native modules will fail. Audit
   dependencies before porting existing code.
3. **No traditional filesystem**: Workers have no disk access. Use R2 for blob
   storage, KV for small values, D1 for relational data.
4. **Durable Objects are a different programming model**: not a drop-in for a
   database or cache. They require designing around single-object concurrency.
   Read the documentation before committing to them.
5. **KV is eventually consistent**: writes propagate globally within seconds but
   reads may return stale data. Do not use KV for anything that requires
   read-after-write consistency on the same request path.
6. **`@cloudflare/next-on-pages` has coverage gaps**: not all Next.js APIs are
   supported in the Pages adapter. Test with your specific Next.js feature set
   before choosing Pages over Vercel.
7. **No region pinning**: Workers run globally; you cannot pin them to a
   specific region. If compliance requires geographic data residency, Workers
   is not appropriate without additional contractual arrangements.

## see also

- `cloud-vercel.md` — Next.js hosting without edge adapter constraints
- `cloud-fly.md` — container-based global deployment with region control
- `cloud-aws-basics.md` — S3 as the R2 alternative; compare egress costs
- `../stacks/nextjs.md` — Next.js stack profile
- `../standards/security-standards.md`, `../standards/logging-observability.md` — secret handling and observability standards
