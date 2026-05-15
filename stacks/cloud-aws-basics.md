# aws (basics)

AWS is the reference hyperscaler: widest service catalog, largest compliance
coverage, highest operational ceiling, and the most rope. Small teams
frequently underestimate the IAM, networking, and cost-model complexity.

This profile covers the subset most useful for AES projects: ECS Fargate,
App Runner, Lambda, RDS/Aurora, S3, and the cross-cutting concerns (IAM,
networking, cost) that affect all of them.

## when to use

- The workload has outgrown a simpler platform (Railway, Fly) in cost or
  capability terms.
- Compliance, data residency, or enterprise contracts require AWS.
- The team needs services that only AWS provides at scale: SQS, SNS, Kinesis,
  Bedrock, Rekognition, complex ML pipelines.
- Multi-region active-passive or active-active with managed failover (Route 53,
  RDS Multi-AZ, Global Accelerator).
- Fine-grained IAM policies are required for security or audit reasons.
- The team already has AWS expertise and the overhead is a known quantity.

## when not to use

- Small teams or early-stage products where Railway or Fly would ship faster
  and at lower operational cost. AWS setup overhead is real and ongoing.
- Teams that do not have someone who can own IAM, VPC, and cost management.
  Without this ownership, AWS becomes expensive and insecure quickly.
- Prototypes: reach for a simpler platform first; migrate when the requirements
  justify it.

## what it ships well

- The widest service catalog available.
- ECS Fargate: containers without EC2 node management; the default for AES container workloads on AWS.
- App Runner: simpler managed endpoint for single HTTP services; graduates to Fargate when config limits are reached.
- Lambda: event-driven short-duration handlers; not for persistent workers.
- RDS / Aurora Serverless v2: managed relational databases; Aurora Serverless v2 scales to near-zero when idle.
- S3: object storage reference implementation.
- CloudFront: CDN with deep AWS integration; required in front of S3 for user-facing assets.

## stack fit

| Stack | Fit | Notes |
|---|---|---|
| Go-Gin | Excellent | Container on ECS Fargate or App Runner; small image, fast startup. |
| NestJS | Excellent | Container on ECS Fargate; workers as separate task definitions or Lambda for event-driven handlers. |
| Fastify | Excellent | Same as NestJS. Fastify also works well as a Lambda handler with the `@fastify/aws-lambda` adapter for short-lived endpoints. |
| FastAPI | Excellent | Container on ECS Fargate or App Runner. Mangum adapter for Lambda. |
| Next.js | Good | ECS or App Runner for server-rendered Next.js; CloudFront + S3 for static export. Vercel is simpler if AWS is not otherwise required. |

## env config pattern

- Parameter Store for non-secret config; Secrets Manager for secrets (DB passwords, API keys).
- Do not commit `.env` files or secret values to the repository.
- Each ECS task definition or Lambda has an IAM execution role scoped to only the parameters it needs; follow least-privilege strictly.
- Per-environment separation: separate AWS accounts per environment (recommended) or per-environment parameter namespaces (`/myapp/production/KEY`).
- Local development: use `aws-vault` or equivalent to assume a limited dev role.

See `../standards/security-standards.md` for secret handling and env-file rules.

## deployment shape

AWS offers many deployment paths; pick one and be consistent. For AES projects,
choose from: ECS Fargate (containers with rolling deploys via ALB + task
definition updates — the default recommendation), App Runner (simpler managed
endpoint for single-service HTTP APIs; no node management), or Lambda (event-driven
short-duration handlers via CDK/SAM). Do not use Lambda for persistent workers;
the same pitfall that applies to Vercel functions applies here. Automate the
build → ECR push → service update pipeline with GitHub Actions or equivalent.

## cost shape

- AWS is cheapest at scale; surprisingly expensive at small scale.
- Common traps: NAT Gateway ($0.045/GB + hourly), cross-AZ traffic billing,
  public IPv4 charges, RDS Multi-AZ doubling instance cost, CloudWatch Logs
  ingestion at high volume. Set AWS Budgets and Cost Anomaly Detection before
  production; both are free.

## observability

Built-in: CloudWatch Logs, CloudWatch Metrics, X-Ray for distributed tracing
(requires SDK instrumentation), and CloudTrail for API audit.

Gaps: CloudWatch Log Insights is functional but expensive at high volume. Teams
with significant log volume often route to an external provider (Datadog,
Grafana Cloud) for cost and query-experience reasons.

See `../standards/logging-observability.md` for log format and tracing conventions.

## gotchas

1. **IAM is its own discipline**: misconfigurations in IAM are the leading cause
   of AWS security incidents. Follow least-privilege from day one. Use IAM
   Access Analyzer to detect overly permissive policies before they reach
   production.
2. **Multi-region is harder than it looks**: data replication, global routing,
   and failover testing add significant complexity. Plan for this explicitly;
   do not assume it is free with a multi-region deploy.
3. **RDS is excellent but expensive**: an `db.t3.medium` Multi-AZ RDS instance
   costs more per month than an entire Railway project. Consider Aurora
   Serverless v2 for workloads with variable or low sustained usage — it scales
   to near-zero when idle.
4. **Lambda + long-running workers is the same pitfall as Vercel**: Lambda has a
   15-minute maximum execution time and no persistent in-process state. Use
   SQS with ECS/Fargate workers for queue consumers that need long or stateful
   processing.
5. **CloudFront is required for serious static asset delivery**: S3 alone is not
   a CDN. Requests go to a single region; latency is high for distant users.
   Put CloudFront in front of any user-facing S3 bucket.
6. **OpenSearch (formerly Elasticsearch) is expensive**: a two-node domain
   starts at well over $100/month. Prefer alternatives (Typesense, Meilisearch,
   Postgres full-text, or a managed SaaS search) unless the full OpenSearch
   feature set is genuinely required.
7. **AWS SDK v2 vs v3**: the v2 SDK loads the entire AWS namespace as one
   package; the v3 SDK is modular. For Lambda functions where cold-start size
   matters, use v3 and import only the clients you need.
8. **Security defaults need hardening**: new AWS accounts have permissive
   defaults in some areas (S3 public access, IMDSv1, legacy TLS). Apply the
   CIS AWS Foundations Benchmark or run AWS Security Hub to identify and close
   these gaps before going to production.
9. **VPC design is a long-term commitment**: changing the subnet layout or CIDR
   allocation after services are deployed is painful. Design the VPC (public
   subnets, private subnets, AZ count, CIDR blocks) before deploying the first
   service.
10. **Cost Anomaly Detection is not optional**: a misconfigured auto-scaling
    policy, a runaway Lambda invocation loop, or a forgotten NAT Gateway can
    produce a four-figure bill before anyone notices. Treat budget alerts as a
    mandatory part of the initial setup checklist.

## see also

- `cloud-railway.md` — simpler container platform before AWS is justified
- `cloud-fly.md` — global container deployment without AWS complexity
- `cloud-cloudflare.md` — R2 (zero-egress S3 alternative); Workers (Lambda at edge)
- `cloud-vercel.md` — Next.js hosting without AWS overhead
- `../stacks/go.md`, `../stacks/nestjs.md` — stack profiles
- `../stacks/docker.md`, `../stacks/postgres.md` — Docker and Postgres conventions
- `../standards/security-standards.md` — IAM, secret handling, env-var rules
- `../standards/logging-observability.md` — observability standards
