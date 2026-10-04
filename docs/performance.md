# Performance measurements

Every number here was produced by the scripts in `server/scripts/` and is reproducible with the commands at the bottom. Raw output is in `docs/benchmarks/`.

## Test environment

|  |  |
| --- | --- |
| Date | 2 October 2026 |
| Machine | Laptop, Intel Core i7-1165G7 (4 cores / 8 threads), 16 GB RAM, Windows 11, on battery |
| Software | Node.js 25.2.1, MongoDB 8.0.13 |
| Topology | Load generator, API server (one Node process) and MongoDB all on the same machine |

This is a development laptop with other applications running, so treat the absolute times as conservative and the run-to-run spread as real. A dedicated server will be faster and steadier.

## Dataset

Sized for postings that each receive more than 500 applications:

| Collection | Documents |
| --- | --- |
| Users | 20,030 (30 recruiters, 20,000 candidates) |
| Jobs | 300 (10 per recruiter) |
| Applications | 156,112 (about 520 per posting) |

## Compound indexes: before and after

"Before" is the index set the project had previously (single-field indexes on `job`, `candidate`, `status` and `techStack`). "After" is the current schema. Same data, same queries, 100 timed runs per query after 5 warm-up runs.

| Query | Median before | Median after | Change | Documents read before | after |
| --- | --- | --- | --- | --- | --- |
| Recruiter dashboard: pipeline counts across all postings | 28.2 ms | 12.1 ms | 57% faster | 5,262 | 0 |
| Applicants page: status counts for one posting | 4.2 ms | 2.0 ms | 52% faster | 528 | 0 |
| Applicants page: one status, newest first (page of 20) | 6.2 ms | 3.8 ms | 38% faster | 528 | 20 |
| Applicants page: all statuses, ranked by score (page of 20) | 5.3 ms | 2.7 ms | 48% faster | 528 | 20 |
| Candidate dashboard: own applications by status | 1.9 ms | 2.0 ms | no change | 7 | 0 |
| Job board: active postings for one skill tag (page of 12) | 2.9 ms | 2.4 ms | 19% faster | 44 | 12 |

What the indexes change:

- **Counts are answered from the index alone.** `{ job, status, createdAt }` and `{ candidate, status, createdAt }` contain everything the status-count aggregations need, so MongoDB reads zero documents. Before, it fetched every application on the posting.
- **Lists read only the page they return.** A page of 20 applicants reads 20 documents instead of all 528 on the posting, whether sorted by date or by score.
- **Small result sets do not get faster.** A candidate has a handful of applications, so that query was already cheap. The time shown is one round trip to MongoDB.

"Documents read" comes from MongoDB's `explain("executionStats")` and does not depend on the machine. The millisecond figures do.

## Load test: 200 concurrent users

Method:

- 200 signed-in users, each a different account with its own JWT: 170 candidates and 30 recruiters.
- Each user sends a request, waits 0.5 to 1.5 seconds, and repeats. Users arrive over a 10 second ramp-up, then latency is measured for 60 seconds with all 200 active.
- Request mix: browsing and searching the job board, opening postings, own applications, dashboard stats, notifications, skill suggestions, recruiters paging through applicants, and 3% writes (new applications, which also create a notification and queue an email).
- A request counts as failed on any network error or any response outside 2xx. Failures are counted over the whole run, ramp-up included.
- Rate limiting is switched off for the test because every request comes from one IP address. SMTP is off; emails go through the outbox to a console transport.

Six consecutive runs:

| Run | Requests (60 s) | Requests/s | Failed | p50 | p95 | p99 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 11,258 | 188 | 0 | 40 ms | 165 ms | 284 ms |
| 2 | 11,387 | 190 | 0 | 37 ms | 145 ms | 237 ms |
| 3 | 8,500 | 142 | 0 | 362 ms | 832 ms | 1,507 ms |
| 4 | 11,666 | 194 | 0 | 20 ms | 73 ms | 111 ms |
| 5 | 11,786 | 196 | 0 | 11 ms | 37 ms | 60 ms |
| 6 | 11,817 | 197 | 0 | 10 ms | 32 ms | 50 ms |

- **Zero failed requests in all six runs**, 72,747 requests in total including ramp-up.
- **p95 was under 180 ms in five of six runs** (32 to 165 ms; the median of the six is 109 ms).
- **Run 3 is an outlier at 832 ms.** The server was unchanged between runs, and the system CPU was not being sampled during that run, so its cause is not established. In runs 4 to 6, where CPU was sampled, a file-sync client was using 12 to 24% of the processor. Expect this kind of spread on a shared laptop.

Slowest endpoints in run 4, by p95:

| Endpoint | Requests | p50 | p95 |
| --- | --- | --- | --- |
| POST /api/applications | 280 | 51 ms | 151 ms |
| GET /api/applications/my | 1,135 | 29 ms | 97 ms |
| GET /api/applications/job/:id | 599 | 31 ms | 93 ms |
| GET /api/jobs?search= | 1,041 | 20 ms | 70 ms |
| GET /api/jobs | 2,515 | 21 ms | 68 ms |

### What made 200 users possible

The first run of this test had a p95 of 1,294 ms. That run also started all 200 users at once with no ramp-up, so it is not directly comparable with the table above, but three server changes account for most of the difference:

1. **Authenticated user lookups are cached for 30 seconds**, removing one database read from every authenticated request.
2. **Redundant queries were removed.** The applicants page took its total from the status-count aggregation instead of a separate count, and applying no longer re-reads the application to build the response.
3. **Email leaves the request path.** Status-change emails are written to an outbox and delivered in the background, so no API response waits on the mail server.

## Reproduce

Needs MongoDB on `localhost:27017`. Both scripts create and drop their own databases (`skill-sphere-benchmark`, `skill-sphere-loadtest`) and never touch development data.

```bash
cd server

# Index benchmark (about 1 minute)
npm run benchmark -- --iterations 100 --out ../docs/benchmarks/index-benchmark.json

# Load test (about 2 minutes)
npm run loadtest -- --out ../docs/benchmarks/load-test.json

# Options
npm run benchmark -- --apps-per-job 800 --candidates 50000
npm run loadtest -- --users 200 --ramp 10 --duration 60 --think 1000
```
