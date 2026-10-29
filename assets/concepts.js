/* Single source of truth for every lesson: order, part, title and one-line summary.
   Used by app.js for the sidebar, breadcrumbs, prev/next, progress and diagram tooltips. */
window.PARTS = [
  { id: "foundations", title: "Part 1 · Foundations", desc: "How to think about any system design problem: requirements, estimation and the core trade-offs every design is built on." },
  { id: "edge", title: "Part 2 · Edge & Networking", desc: "Everything between the user's phone and your servers: networking, DNS, CDN, load balancing, gateways, auth and rate limiting." },
  { id: "services", title: "Part 3 · Application Services", desc: "API design, microservices and the Instagram feature services — uploads, stories, likes, the social graph, feed, search and DMs." },
  { id: "data", title: "Part 4 · Data Layer", desc: "How data is stored and scaled: databases, indexing, replication, sharding, consistent hashing, caching, blob storage and IDs." },
  { id: "async", title: "Part 5 · Async Processing", desc: "Decoupling work with queues and streams: Kafka, media pipelines, notifications, analytics and ML ranking." },
  { id: "ops", title: "Part 6 · Reliability & Operations", desc: "Keeping a planet-scale system up: resilience patterns, multi-region DR, observability and security." },
  { id: "together", title: "Part 7 · Putting It All Together", desc: "End-to-end request flows, a full interview walkthrough and a glossary of every term." }
];

window.CONCEPTS = [
  // ---------------- Part 1 ----------------
  { slug: "how-to-approach", part: "foundations", title: "How to Approach a System Design Problem", summary: "A repeatable 6-step framework for designing any large system (and acing the interview)." },
  { slug: "requirements", part: "foundations", title: "Requirements: Functional & Non-Functional", summary: "Turning 'build Instagram' into a precise scope: features, scale, latency, availability and consistency targets." },
  { slug: "capacity-estimation", part: "foundations", title: "Back-of-the-Envelope Estimation", summary: "Estimating QPS, storage, bandwidth and cache size for Instagram with simple, defensible math." },
  { slug: "core-principles", part: "foundations", title: "Scalability, Availability, Reliability & Performance", summary: "Vertical vs horizontal scaling, SLAs and 'nines', latency vs throughput, and single points of failure." },
  { slug: "cap-consistency", part: "foundations", title: "CAP Theorem, PACELC & Consistency Models", summary: "Why distributed systems must trade consistency for availability, and the spectrum from strong to eventual consistency." },

  // ---------------- Part 2 ----------------
  { slug: "clients", part: "edge", title: "Clients: Mobile & Web Apps", summary: "What the app itself does: client caching, optimistic UI, offline mode, pagination, prefetching and image formats." },
  { slug: "networking-basics", part: "edge", title: "Networking Basics: IP, TCP, HTTP & TLS", summary: "The protocols under every request: TCP vs UDP, HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC), TLS handshakes and keep-alive." },
  { slug: "dns", part: "edge", title: "DNS: The Internet's Phone Book", summary: "How a domain name becomes an IP address, record types, TTLs, GeoDNS and DNS-based failover." },
  { slug: "cdn", part: "edge", title: "Content Delivery Network (CDN)", summary: "Serving photos and videos from edge servers near users: push vs pull, cache keys, TTLs, invalidation and origin shielding." },
  { slug: "load-balancer", part: "edge", title: "Load Balancing", summary: "Spreading traffic across servers: L4 vs L7, algorithms, health checks, sticky sessions and avoiding the LB as a SPOF." },
  { slug: "api-gateway", part: "edge", title: "API Gateway & Reverse Proxy", summary: "The single front door for all APIs: routing, authentication, rate limiting, TLS termination, aggregation and BFFs." },
  { slug: "rate-limiting", part: "edge", title: "Rate Limiting", summary: "Protecting services from abuse and overload: token bucket, leaky bucket, fixed and sliding windows, distributed limiters." },
  { slug: "authentication", part: "edge", title: "Authentication & Authorization", summary: "Who are you and what may you do: sessions vs JWTs, OAuth 2.0, refresh tokens, password storage and the User/Auth service." },

  // ---------------- Part 3 ----------------
  { slug: "api-design", part: "services", title: "API Design: REST, gRPC, GraphQL & WebSockets", summary: "Designing Instagram's APIs: resources, pagination, idempotency keys, versioning and choosing the right protocol." },
  { slug: "microservices", part: "services", title: "Microservices & Stateless Services", summary: "Monolith vs microservices, statelessness, service discovery, inter-service communication and data ownership." },
  { slug: "media-upload", part: "services", title: "Media Upload Service & Pre-signed URLs", summary: "Uploading huge photos/videos reliably: pre-signed URLs, direct-to-storage, chunked & resumable uploads, dedup." },
  { slug: "stories", part: "services", title: "Stories & Ephemeral (TTL) Data", summary: "Designing 24-hour content: TTL expiry, the stories tray, seen-state tracking and highlights." },
  { slug: "likes-comments", part: "services", title: "Likes, Comments & Counters at Scale", summary: "Handling write-heavy engagement: sharded counters, hot keys, approximate counts and comment threading." },
  { slug: "social-graph", part: "services", title: "Social Graph & Follow Service", summary: "Storing who-follows-whom for billions of edges: adjacency lists, bidirectional indexes and celebrity accounts." },
  { slug: "news-feed", part: "services", title: "News Feed: Fan-out & Ranking", summary: "The heart of Instagram: fan-out-on-write vs on-read, the hybrid model for celebrities, timeline caches and ML ranking." },
  { slug: "search", part: "services", title: "Search & Inverted Indexes", summary: "Finding users, hashtags and places fast: inverted indexes, Elasticsearch, typeahead, tries and relevance ranking." },
  { slug: "direct-messaging", part: "services", title: "Real-time Direct Messaging", summary: "Chat at scale: WebSockets vs polling, connection gateways, message ordering, delivery receipts and offline delivery." },

  // ---------------- Part 4 ----------------
  { slug: "databases", part: "data", title: "Databases: SQL vs NoSQL", summary: "Relational, key-value, wide-column, document and graph stores; ACID vs BASE; picking the right DB for each Instagram dataset." },
  { slug: "indexing", part: "data", title: "Database Indexing & Storage Engines", summary: "How databases find data fast: B-trees, LSM-trees, primary/secondary/composite indexes and their write cost." },
  { slug: "replication", part: "data", title: "Replication", summary: "Copying data for availability and read scale: leader-follower, multi-leader, leaderless quorums and replication lag." },
  { slug: "sharding", part: "data", title: "Sharding (Partitioning)", summary: "Splitting data across machines: shard keys, range vs hash partitioning, hotspots, resharding and cross-shard queries." },
  { slug: "consistent-hashing", part: "data", title: "Consistent Hashing", summary: "Distributing keys so adding/removing servers moves minimal data: the hash ring and virtual nodes." },
  { slug: "caching", part: "data", title: "Caching (Redis & Memcached)", summary: "Making reads fast: cache-aside, write-through/back, eviction policies, invalidation, stampedes and hot keys." },
  { slug: "object-storage", part: "data", title: "Object / Blob Storage (S3)", summary: "Storing petabytes of photos and videos: objects vs files vs blocks, durability, storage tiers and lifecycle rules." },
  { slug: "id-generation", part: "data", title: "Unique ID Generation (Snowflake)", summary: "Generating billions of unique, time-sortable IDs without a central counter — including Instagram's own scheme." },

  // ---------------- Part 5 ----------------
  { slug: "message-queues", part: "async", title: "Message Queues, Pub/Sub & Kafka", summary: "Decoupling services with events: queues vs logs, partitions, consumer groups, delivery guarantees and ordering." },
  { slug: "media-processing", part: "async", title: "Media Processing Pipeline", summary: "Turning an upload into many renditions: resizing, transcoding, adaptive bitrate streaming and content moderation." },
  { slug: "notifications", part: "async", title: "Notification System", summary: "Delivering push, in-app and email notifications: APNs/FCM, fan-out, batching, preferences and deduplication." },
  { slug: "analytics-ml", part: "async", title: "Analytics, Data Pipelines & ML Ranking", summary: "Batch vs stream processing, data warehouses, and how ranking models decide what you see in Feed and Explore." },

  // ---------------- Part 6 ----------------
  { slug: "resilience-patterns", part: "ops", title: "Resilience: Timeouts, Retries & Circuit Breakers", summary: "Surviving partial failure: timeouts, retries with backoff, idempotency, circuit breakers, bulkheads and graceful degradation." },
  { slug: "multi-region", part: "ops", title: "Multi-Region Architecture & Disaster Recovery", summary: "Running across data centers: active-passive vs active-active, RPO/RTO, failover and data residency." },
  { slug: "observability", part: "ops", title: "Monitoring, Logging & Tracing", summary: "Knowing what your system is doing: metrics, logs, distributed traces, SLOs, alerting and dashboards." },
  { slug: "security", part: "ops", title: "Security & Privacy", summary: "Encryption in transit and at rest, DDoS protection, secrets, abuse prevention and privacy controls." },

  // ---------------- Part 7 ----------------
  { slug: "request-flows", part: "together", title: "End-to-End Request Flows", summary: "Step-by-step walkthroughs of posting a photo, loading the feed, liking, following, searching and sending a DM." },
  { slug: "interview-guide", part: "together", title: "Instagram Design: Full Interview Walkthrough", summary: "A complete 45-minute interview script for 'Design Instagram', with deep dives and follow-up questions." },
  { slug: "glossary", part: "together", title: "Glossary", summary: "Every system design term used in this guide, explained in one or two sentences with a link to the lesson." }
];
