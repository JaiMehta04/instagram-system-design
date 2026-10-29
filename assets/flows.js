/* Guided request flows for the interactive diagram.
   nodes/edges reference ids in the SVG (n-<key>, e-<key>); learn lists lesson slugs. */
window.FLOWS = [
  {
    id: "upload", icon: "📤", title: "Post a photo",
    steps: [
      { title: "Find the servers", nodes: ["mobile", "dns"], edges: ["client-dns"], learn: ["dns", "networking-basics"],
        text: "The app resolves <code>i.instagram.com</code> via DNS. GeoDNS/anycast returns the IP of a nearby, healthy entry point so the request travels the shortest distance." },
      { title: "Enter through the front door", nodes: ["mobile", "lb", "gw"], edges: ["client-lb", "lb-gw"], learn: ["load-balancer", "api-gateway", "authentication", "rate-limiting"],
        text: "An HTTPS request hits the <b>Load Balancer</b>, which picks a healthy gateway instance. The <b>API Gateway</b> terminates TLS, validates the access token, applies rate limits (anti-spam) and routes to the Upload Service." },
      { title: "Get a pre-signed upload URL", nodes: ["gw", "upload"], edges: ["gw-svc"], learn: ["media-upload", "id-generation", "api-design"],
        text: "The <b>Upload Service</b> creates a post in state <code>UPLOADING</code> with a new time-sortable 64-bit ID (Snowflake-style) and returns a short-lived <b>pre-signed URL</b>. The app sends an idempotency key so retries don't create duplicate posts." },
      { title: "Upload the bytes straight to storage", nodes: ["upload", "s3"], edges: ["upload-s3"], learn: ["object-storage", "media-upload"],
        text: "The app uploads the photo <b>directly to Object Storage</b> using the pre-signed URL (chunked & resumable for big videos). App servers never handle the heavy bytes, so they stay small and stateless." },
      { title: "Save the post metadata", nodes: ["upload", "postdb"], edges: ["upload-postdb"], learn: ["databases", "sharding", "replication"],
        text: "Caption, media keys, location and author are written to the <b>Post metadata store</b> (Cassandra, sharded by <code>user_id</code>, replicated 3×)." },
      { title: "Publish an event", nodes: ["upload", "kafka"], edges: ["ev-upload", "bus"], learn: ["message-queues", "microservices"],
        text: "The Upload Service publishes <code>PostCreated</code> to <b>Kafka</b> (reliably, via an outbox) and immediately responds to the app. Everything else happens <b>asynchronously</b>, so the user isn't kept waiting." },
      { title: "Process the media", nodes: ["kafka", "media", "s3"], edges: ["kafka-consumers", "media-s3"], learn: ["media-processing"],
        text: "<b>Media Processing Workers</b> strip EXIF/GPS, generate renditions (150px … 1080px, WebP/AVIF), transcode videos into adaptive-bitrate segments and run moderation classifiers. Renditions are stored back in Object Storage; the post becomes <code>PUBLISHED</code>." },
      { title: "Fan out to followers' feeds", nodes: ["kafka", "fanout", "graphdb", "feedcache"], edges: ["kafka-consumers", "fanout-feedcache"], learn: ["news-feed", "social-graph", "caching"],
        text: "<b>Fan-out workers</b> read the author's followers from the Social Graph and push the new post ID into each active follower's timeline in the <b>Redis feed cache</b>. Celebrities are skipped (their posts are pulled at read time) to avoid writing to 100M+ timelines." },
      { title: "Index for search", nodes: ["kafka", "indexer", "es"], edges: ["kafka-consumers", "idx-es"], learn: ["search", "indexing"],
        text: "The <b>Search Indexer</b> adds caption hashtags, location and tagged users to the Elasticsearch inverted index — searchable within seconds (eventual consistency)." },
      { title: "Notify people", nodes: ["kafka", "notif", "push", "mobile"], edges: ["kafka-consumers", "notif-push", "push-client"], learn: ["notifications"],
        text: "The <b>Notification Service</b> notifies tagged users (respecting preferences and rate limits) through <b>APNs/FCM</b>, which deliver the push to their phones." },
      { title: "Feed the ML models", nodes: ["kafka", "analytics"], edges: ["kafka-consumers"], learn: ["analytics-ml"],
        text: "The event also lands in the data warehouse. Engagement on this post will later train the ranking models that decide where it appears in Feed and Explore." }
    ]
  },
  {
    id: "feed", icon: "📰", title: "Open the home feed",
    steps: [
      { title: "Request the feed", nodes: ["mobile", "lb", "gw"], edges: ["client-lb", "lb-gw"], learn: ["load-balancer", "api-gateway", "api-design"],
        text: "The app calls <code>GET /v1/feed?cursor=…</code>. Load Balancer → API Gateway (auth + rate limit) → News Feed Service." },
      { title: "Read the precomputed timeline", nodes: ["gw", "feed", "feedcache"], edges: ["gw-svc", "feed-feedcache"], learn: ["news-feed", "caching"],
        text: "The <b>News Feed Service</b> reads the user's timeline — a list of post IDs already pushed there by fan-out workers — from the <b>Redis feed cache</b>. This is O(1) and takes ~1 ms." },
      { title: "Merge celebrity posts (pull)", nodes: ["feed", "postdb", "graphdb"], edges: [], learn: ["news-feed", "social-graph"],
        text: "For the few celebrities the user follows, recent posts are <b>pulled</b> at read time and merged in. This is the <b>hybrid fan-out</b> model." },
      { title: "Hydrate & rank", nodes: ["feed", "postdb", "analytics"], edges: [], learn: ["analytics-ml", "databases", "core-principles"],
        text: "Post metadata, authors, like counts and \"did I like this\" flags are batch-fetched (mostly from cache). An ML model scores the candidates by predicted engagement and the top page is returned with a cursor for the next page." },
      { title: "Return JSON with CDN URLs", nodes: ["feed", "gw", "mobile"], edges: ["gw-svc", "client-lb"], learn: ["api-design", "clients"],
        text: "The response contains only metadata plus <b>signed CDN URLs</b> for each image — never the image bytes. The app renders text immediately and shows blur placeholders." },
      { title: "Load images from the CDN", nodes: ["mobile", "cdn"], edges: ["client-cdn"], learn: ["cdn", "clients"],
        text: "The app fetches the right-sized renditions from the <b>nearest CDN edge</b> (~10–30 ms on a cache hit) and prefetches the next posts while you scroll." },
      { title: "Cache miss → origin pull", nodes: ["cdn", "s3"], edges: ["s3-cdn"], learn: ["cdn", "object-storage"],
        text: "If the edge doesn't have an image (an old or rarely-viewed post) it pulls it once from <b>Object Storage</b> via an origin shield, caches it, and serves it. Popular content is almost always a hit." }
    ]
  },
  {
    id: "like", icon: "❤️", title: "Like a post",
    steps: [
      { title: "Optimistic UI", nodes: ["mobile"], edges: [], learn: ["clients"],
        text: "The heart turns red <b>instantly</b> on the phone (optimistic update); the request is sent in the background and rolled back only if it fails." },
      { title: "Through the gateway", nodes: ["mobile", "lb", "gw", "likes"], edges: ["client-lb", "lb-gw", "gw-svc"], learn: ["api-gateway", "rate-limiting"],
        text: "<code>POST /v1/posts/{id}/likes</code> passes the LB and gateway. Rate limits stop bots from liking thousands of posts per hour." },
      { title: "Record the like idempotently", nodes: ["likes", "postdb", "feedcache"], edges: ["likes-postdb"], learn: ["likes-comments", "caching", "resilience-patterns"],
        text: "The <b>Like & Comment Service</b> writes <code>(post_id, user_id)</code> — a duplicate tap is a no-op (idempotent). The like counter is incremented in Redis and flushed to the database in batches to avoid hot-row contention on viral posts." },
      { title: "Emit an event", nodes: ["likes", "kafka"], edges: ["ev-likes", "bus"], learn: ["message-queues"],
        text: "A <code>PostLiked</code> event is published to Kafka; the API returns <code>200</code> right away." },
      { title: "Notify the author", nodes: ["kafka", "notif", "push", "mobile"], edges: ["kafka-consumers", "notif-push", "push-client"], learn: ["notifications"],
        text: "The Notification Service aggregates (\"Alex and 20 others liked your post\"), checks the author's preferences and sends a push via APNs/FCM." },
      { title: "Learn from it", nodes: ["kafka", "analytics"], edges: ["kafka-consumers"], learn: ["analytics-ml"],
        text: "The like becomes a training signal: the ranking model learns that this viewer has affinity with this author and this kind of content." }
    ]
  },
  {
    id: "follow", icon: "➕", title: "Follow someone",
    steps: [
      { title: "Send the follow", nodes: ["mobile", "lb", "gw", "graph"], edges: ["client-lb", "lb-gw", "gw-svc"], learn: ["api-design", "authentication"],
        text: "<code>POST /v1/users/{id}/follow</code>. If the target account is private this creates a follow <i>request</i> instead (an authorization rule)." },
      { title: "Write both directions", nodes: ["graph", "graphdb"], edges: ["graph-graphdb"], learn: ["social-graph", "sharding"],
        text: "The <b>Follow/Graph Service</b> writes the edge to two indexes — <i>A's following list</i> (sharded by A) and <i>B's followers list</i> (sharded by B) — so both questions are answered with a single-shard read." },
      { title: "Publish FollowCreated", nodes: ["graph", "kafka"], edges: ["ev-graph", "bus"], learn: ["message-queues"],
        text: "An event goes to Kafka so other systems can react without the Graph Service knowing about them." },
      { title: "Backfill the timeline", nodes: ["kafka", "fanout", "feedcache"], edges: ["kafka-consumers", "fanout-feedcache"], learn: ["news-feed"],
        text: "Fan-out workers insert the new followee's recent posts into the follower's timeline so they appear in the feed immediately." },
      { title: "Tell the followee", nodes: ["kafka", "notif", "push"], edges: ["kafka-consumers", "notif-push", "push-client"], learn: ["notifications"],
        text: "\"Sam started following you\" — delivered via APNs/FCM and stored in the in-app activity feed." }
    ]
  },
  {
    id: "story", icon: "⏱️", title: "Post a story",
    steps: [
      { title: "Upload the media", nodes: ["mobile", "gw", "upload", "s3"], edges: ["client-lb", "lb-gw", "gw-svc", "upload-s3"], learn: ["media-upload", "object-storage"],
        text: "Same pre-signed-URL upload path as a post: the bytes go straight to Object Storage." },
      { title: "Create the story with a 24h TTL", nodes: ["stories", "postdb"], edges: ["stories-postdb"], learn: ["stories", "databases"],
        text: "The <b>Stories Service</b> stores the story with <code>expires_at = now + 24h</code> (database TTL); an object-storage lifecycle rule later cleans up the media unless it's saved to a Highlight." },
      { title: "Publish StoryCreated", nodes: ["stories", "kafka"], edges: ["ev-stories", "bus"], learn: ["message-queues"],
        text: "The event lets fan-out update followers' <b>stories trays</b>, and media workers transcode the video." },
      { title: "Process & fan out", nodes: ["kafka", "media", "fanout", "feedcache", "s3"], edges: ["kafka-consumers", "media-s3", "fanout-feedcache"], learn: ["media-processing", "news-feed"],
        text: "Renditions are produced, and the author is marked as having a fresh story in followers' tray caches, ranked by closeness." },
      { title: "Viewers watch via the CDN", nodes: ["mobile", "cdn"], edges: ["client-cdn", "s3-cdn"], learn: ["cdn", "clients"],
        text: "Viewers' apps prefetch the first segments of the next stories from the CDN so tapping through feels instant. Seen-state is recorded so the ring turns grey." }
    ]
  },
  {
    id: "search", icon: "🔍", title: "Search",
    steps: [
      { title: "Typeahead request", nodes: ["mobile", "lb", "gw", "search"], edges: ["client-lb", "lb-gw", "gw-svc"], learn: ["search", "rate-limiting", "clients"],
        text: "As the user types <code>\"sun\"</code>, the app sends debounced requests (e.g. every 150 ms) to the <b>Search Service</b>." },
      { title: "Query the inverted index", nodes: ["search", "es"], edges: ["search-es"], learn: ["search", "indexing"],
        text: "Elasticsearch looks up the prefix in an inverted/edge-n-gram index across shards, then ranks matches by text relevance (BM25), popularity and your social graph (people you follow first)." },
      { title: "Index kept fresh by events", nodes: ["kafka", "indexer", "es"], edges: ["kafka-consumers", "idx-es"], learn: ["message-queues", "cap-consistency"],
        text: "New users, hashtags and posts flow in via Kafka → Search Indexer, so the index is <b>eventually consistent</b> — usually seconds behind the source of truth." }
    ]
  },
  {
    id: "dm", icon: "💬", title: "Send a DM",
    steps: [
      { title: "Persistent connection", nodes: ["mobile", "lb", "gw", "dm"], edges: ["client-lb", "lb-gw", "gw-svc"], learn: ["direct-messaging", "networking-basics", "load-balancer"],
        text: "The app keeps a long-lived <b>WebSocket</b> (or MQTT) connection to a DM gateway server. The LB must support long-lived connections." },
      { title: "Store the message", nodes: ["dm", "msgdb"], edges: ["dm-msgdb"], learn: ["direct-messaging", "databases", "id-generation"],
        text: "The <b>Direct Messaging service</b> assigns a per-conversation sequence number and writes the message to the <b>Messages Store</b> (partitioned by conversation_id), then ACKs the sender (✓ sent)." },
      { title: "Recipient online → deliver instantly", nodes: ["dm", "mobile"], edges: [], learn: ["direct-messaging"],
        text: "A session registry (user → gateway server) tells the service which connection to push to; the recipient's app ACKs (✓✓ delivered)." },
      { title: "Recipient offline → push notification", nodes: ["kafka", "notif", "push", "mobile"], edges: ["kafka-consumers", "notif-push", "push-client"], learn: ["notifications"],
        text: "If no live connection exists, a push notification is sent via APNs/FCM. When the app reconnects, it syncs everything after its last-seen sequence number." }
    ]
  }
];
