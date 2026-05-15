# fly.io

Fly.io runs lightweight Firecracker-based VMs (called Machines) in a global
network of regions. It is not a serverless function platform and not a
hyperscaler. It occupies the space between "managed PaaS" and "raw cloud":
you get real machine primitives, persistent volumes, private networking, and
region selection — without managing a Kubernetes cluster or VPC.

## when to use

- Global low-latency services: place Machines in the regions your users are in
  and let Fly route requests to the nearest live instance.
- Services that need persistent volumes: databases, caches, file-based stores,
  or any workload that requires a stable disk that survives process restarts.
- Workloads that need a real process model: long-running workers, WebSocket
  servers, queue consumers, schedulers — anything that must stay alive and
  is not compatible with a serverless model.
- Teams comfortable with a CLI-driven workflow who want more control than Railway without the full weight of AWS.
- Running lightweight Postgres or SQLite (LiteFS) close to the application to minimize round-trip latency.

## when not to use

- Simple JAMstack or static sites: Fly adds unnecessary complexity here;
  Vercel or Cloudflare Pages are simpler.
- Teams that need zero-ops: Fly assumes familiarity with `fly.toml`, region
  selection, and VM sizing. The dashboard is thin; the CLI is the primary
  control surface. Railway or Vercel is less friction for teams without that fluency.
- Workloads needing managed add-ons with automated failover: Fly provides the
  primitives, but you own more operational responsibility than on Railway.

## what it ships well

- True global deployment: `fly.toml` lists regions; `fly deploy` places
  Machines there.
- Persistent volumes: attach a volume to a Machine and data survives restarts
  and redeployments.
- Private networking: all Machines in an organization share a WireGuard-based
  private network (`<app>.internal` DNS) without configuration.
- Firecracker VMs: faster boot than full VMs; closer to containers than to EC2.
- Machine auto-stop/start: Machines stop when idle and start on the next
  inbound connection, reducing cost for low-traffic services.
- Pay-per-second billing: you are charged only for the time Machines are
  running.

## stack fit

| Stack | Fit | Notes |
|---|---|---|
| Go-Gin | Excellent | Small binary, fast start, maps naturally to Fly's VM model. |
| FastAPI | Excellent | Python container with Uvicorn; pairs well with a Fly Postgres volume. |
| Fastify | Excellent | Node container with workers or queues runs without modification. |
| NestJS | Excellent | Long-lived container with all NestJS features; no serverless caveats. |
| Next.js | Good | Works; Fly has Next.js deployment examples. Prefer Vercel if you do not need global edge control or co-location with a backend service. |

## env config pattern

- Secrets are set with `fly secrets set KEY=value`. They are encrypted at rest
  and injected as env vars at runtime; they are never visible in logs or CLI
  output after being set.
- Non-secret config (region list, VM size, health-check path, port, mount
  paths) lives in `fly.toml`, which is committed to the repository.
- Do not put secrets in `fly.toml`.
- Per-environment separation is done by deploying to separate Fly apps
  (e.g., `myapp-staging`, `myapp-production`), each with its own secrets.
- Pull current secret names (not values) with `fly secrets list`.

See `../standards/security-standards.md` for the general rules on secret
handling and the prohibition on committing secret values.

## deployment shape

Running `fly deploy` builds the image using Buildpacks or a local Dockerfile,
pushes it to Fly's internal registry, and then replaces running Machines in
each configured region with the new image using a rolling or immediate strategy.
The Machines model means each "instance" is a thin VM that boots from the image
in under a second. If `auto_stop_machines` is set in `fly.toml`, Machines that
have been idle will restart automatically when a new request arrives. Health
checks gate traffic; a Machine that does not pass its check will not receive
requests from the Fly proxy.

## cost shape

- Billing is per second of Machine runtime, not per invocation or per month.
- Small Machines (shared-cpu-1x, 256 MB RAM) are inexpensive; cost scales with
  CPU and memory allocation.
- Persistent volumes are billed per GB provisioned per month.
- Outbound bandwidth is metered; inter-region private-network traffic is also billed.
- At low traffic, auto-stop reduces cost significantly. At consistent high
  traffic, Fly is often cheaper than equivalent AWS configurations.
- Free allowance covers a small number of shared-cpu Machines and a few GB of
  volume storage per organization.

## observability

Built-in: `fly logs` streams runtime logs from all Machines for an app; the
dashboard shows basic deployment history and Machine status.

Gaps: no integrated metrics dashboard, no distributed tracing, no log
persistence beyond a rolling buffer. Export logs via `fly logs` to a log drain
or wire in a sidecar process. For metrics, use Prometheus scraping (Fly exposes
a metrics endpoint) or push to an external provider.

See `../standards/logging-observability.md` for the expected structured log
format and observability standards.

## gotchas

1. **Region selection matters**: Machines are placed in the regions you specify.
   A region with a single Machine is a single point of failure. Decide upfront
   whether you need one Machine per region or multiple.
2. **Volumes are zone-local**: a persistent volume is attached to a Machine in
   one specific region. If you deploy to multiple regions, you need one volume
   per region and you own the replication logic. There is no automatic
   cross-region volume sync.
3. **Auto-stop cold starts**: when `auto_stop_machines = true`, a Machine that
   has been stopped will take 1–3 seconds to start on the next request. For
   latency-sensitive endpoints, keep at least one Machine running
   (`min_machines_running = 1`).
4. **The CLI is the primary control surface**: the web dashboard is intentionally
   thin. Most operational tasks (scaling, secret rotation, Machine management,
   log tailing) go through `flyctl`. Onboard the whole team to the CLI early.
5. **Private networking uses `.internal` DNS**: service-to-service calls within
   an organization use `<app>.internal` hostnames over the WireGuard mesh.
   External DNS does not resolve these; services must use the internal addresses
   when calling each other.
6. **Dockerfile is effectively required for non-trivial apps**: Fly supports
   Buildpacks but the Dockerfile path is more predictable. Invest in a proper
   Dockerfile rather than relying on auto-detection.

## see also

- `cloud-vercel.md` — simpler choice for Next.js and static-only workloads
- `cloud-railway.md` — simpler PaaS if global distribution is not required
- `cloud-cloudflare.md` — edge-native Workers for latency-sensitive stateless workloads
- `cloud-aws-basics.md` — when Fly's ceiling is reached or compliance requires AWS
- `../stacks/go.md`, `../stacks/fastapi.md` — stack profiles
- `../stacks/docker.md` — Docker conventions for Dockerfile-based deploys
- `../standards/security-standards.md` — secret handling rules
- `../standards/logging-observability.md` — observability standards
