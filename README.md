# 90-Day Interview Command Center 🎯

> **"This is not a task manager. It is a learning operating system."**

A production-ready full-stack web application designed for a 90-day technical interview preparation journey targeting **SDE2 and Senior .NET Backend roles (20–25+ LPA)**. Inspired by the clean, keyboard-driven, high-velocity UX of **Linear**, **Vercel**, **GitHub**, and **Notion**.

---

## 📅 Day 0 Kickoff & Pre-Seeded State

The command center is initialized with **Day 0 (Kickoff)**:
- **Start Date**: Tomorrow (`Day 1`). Today is Day 0 for environment calibration and strategy review.
- **Pre-Seeded Topics**: **157 Curated Topics** across DSA, System Design, and Backend Engineering.
- **Initial Topic State**: All topics start in `pending` status with `🌱 Level 1: Need Practice` readiness and Leitner `Box 1`.
- **Clean Activity Log**: Zero completed topics, clean 0-day streak, ready for your 90-day journey.

---

## 🏛️ The Curriculum Pillars & Modules

### 1. DSA (LeetCode) — Highest Priority (99 Questions)
Curated 5-phase roadmap covering high-frequency SDE2 interview patterns:
- **Phase 1: Foundation (39 Questions)**: Arrays, Two Pointers, Sliding Window, Prefix Sum, Binary Search, Hash Maps, Monotonic Stacks, Queues.
- **Phase 2: Core Interview (28 Questions)**: Linked Lists, Binary Trees, BSTs, Heaps/Priority Queues, Intervals, 2D Matrix traversal.
- **Phase 3: Backend Favorites (15 Questions)**: Graph traversal, BFS/DFS flood fill, Topological Sort (Kahn's), Tries, Backtracking.
- **Phase 4: Dynamic Programming Essentials (10 Questions)**: 1D DP, Knapsack 0/1, Unbounded Knapsack, Subsequence DP (LIS, LCS), Levenshtein Edit Distance.
- **Phase 5: Stretch Hard Questions (7 Questions)**: Trapping Rain Water, Minimum Window Substring, Largest Rectangle in Histogram, Word Ladder, Burst Balloons.

### 2. System Design Architecture (25 Topics)
Expanded coverage balancing fundamental distributed building blocks with high-throughput case studies:
- **12 Architecture Fundamentals**:
  - Vertical vs Horizontal Scaling & Bottlenecks
  - Load Balancers & Algorithms (L4 vs L7, NGINX, HAProxy, Envoy)
  - Consistent Hashing & Virtual Nodes
  - Caching Strategies & Eviction (Cache-Aside, Write-Back, Stampede Mitigation)
  - CAP Theorem & PACELC Trade-offs (Consistency Models)
  - Database Sharding & Partitioning (Range, Hash, Directory, Resharding)
  - Relational (ACID) vs NoSQL (Document, Key-Value, Wide-Column, Graph)
  - Message Queues & Event Streaming (Kafka vs RabbitMQ vs SQS)
  - Distributed Transactions & The Saga Pattern (Orchestration vs Choreography, Outbox Pattern)
  - Database Replication, Quorum & Replication Lag (Sync vs Async, Read-After-Write)
  - API Protocols & Serialization (REST, gRPC, GraphQL, WebSockets)
  - Distributed Unique ID Generation (Snowflake, ULID, UUIDv7)
- **13 Real-World Case Studies**:
  - Design a URL Shortener (TinyURL / Bitly)
  - Design a Distributed Rate Limiter
  - Design a Real-Time Chat System (WhatsApp / Slack)
  - Design a Video Streaming Platform (YouTube / Netflix)
  - Design an E-Commerce Flash Sale & Inventory Reservation System
  - Design a Distributed Web Crawler & Search Indexer (Google Bot)
  - Design a Distributed Key-Value Store (DynamoDB / Cassandra)
  - Design a Proximity Service / Nearby Places (Yelp / Google Maps)
  - Design a Ride-Sharing Dispatch System (Uber / Lyft)
  - Design a Social Network News Feed (Twitter / Instagram)
  - Design a Distributed Notification Service (APNs / FCM)
  - Design a Distributed Task Scheduler & Job Orchestrator
  - Design a Metrics Monitoring & Alerting System (Prometheus / Datadog)

### 3. Backend Engineering (.NET SDE2 Focus — 33 Topics)
Focuses directly on what production backend engineers touch day-to-day:
- **C# Fundamentals**: Classes vs Records vs Structs, Interfaces, Generics & Constraints, LINQ & Deferred Execution (`IEnumerable` vs `IQueryable`), Delegates & Events, `IDisposable` & `IAsyncDisposable`.
- **Async Programming**: `async` / `await` State Machine & Task internals, `Task.WhenAll`, `CancellationToken` cooperative cancellation, `ConfigureAwait(false)` & `SynchronizationContext`.
- **ASP.NET Core Web API**: Middleware Pipeline execution order, Controllers vs Minimal APIs, FluentValidation & Action/Exception Filters.
- **Dependency Injection**: Service Lifetimes (Transient, Scoped, Singleton) and detecting/fixing the **Captive Dependency bug**.
- **Database Skills (SQL & EF Core)**: Joins, Indexes (Clustered vs Non-Clustered), Execution Plans & Sargability, EF Core `.AsNoTracking()`, N+1 problem, Eager Loading (`.Include()`) and Split Queries (`.AsSplitQuery()`).
- **API Design**: Keyset (Cursor) Pagination, RFC 7807 ProblemDetails, Idempotency-Key patterns.
- **Authentication & Authorization**: JWT token validation, Claims, Policy-Based Authorization.
- **Messaging Systems**: Apache Kafka (Partitions, Consumer Groups, Offsets), NATS (Core vs JetStream), Dead Letter Queues (DLQ), Retries & Idempotent Consumers.
- **gRPC**: Protocol Buffers, Unary vs Streaming RPC, contract-first design.
- **Background Processing**: `BackgroundService`, `System.Threading.Channels` (bounded queues with backpressure).
- **Caching**: Redis Distributed Caching, Cache-Aside lifecycle, Cache Stampede / Thundering Herd mitigation.
- **Logging & Observability**: Structured Logging with Serilog (Message Templates), Correlation IDs, OpenTelemetry traces.
- **Testing**: Unit Testing with xUnit & Moq, Integration Testing with `WebApplicationFactory`.
- **Docker & CI/CD**: Multi-stage Dockerfiles (Chiseled runtime images), Azure DevOps & GitHub Actions pipelines.
- **Git Mastery**: Interactive Rebase (`git rebase -i`), Cherry-Pick, 3-way conflict resolution.
- **Production SDE2 Skills**: Polly v8 Resilience (Circuit Breaker, Retries with Jitter), CLR GC Generations (0, 1, 2) & Large Object Heap (LOH), Built-in .NET 8 Rate Limiter, `SemaphoreSlim` & `Interlocked` thread safety, `IOptions` and Feature Flags.

### 4. SQL Command Practice Console (New Interactive Section)
An in-browser SQL IDE and interactive sandbox with real-time query execution:
- **Interactive Sandbox Database**: In-memory SQLite populated with real enterprise schemas:
  - `Employees` (Includes manager hierarchies and salary variations)
  - `Departments` (Engineering, DevOps, Product, Sales)
  - `Customers` (Includes duplicate emails and never-ordered users)
  - `Orders` (Order dates, amounts, status)
  - `Products` (Inventory, price, dead stock)
- **8 SDE2 Interview Challenges**:
  1. Find 2nd Highest Salary (Subqueries & Window Functions)
  2. Employees Earning More Than Their Manager (Self Joins)
  3. Top 3 Customers by Total Spend (`GROUP BY` & Aggregations)
  4. Department Top Earners (`DENSE_RANK()` Partitioning)
  5. Customers with Duplicate Email Addresses (`HAVING COUNT(*) > 1`)
  6. Monthly Revenue & Order Volume Breakdown (Date Functions)
  7. Products with Zero Orders (`LEFT JOIN` / `NOT EXISTS`)
  8. Running Total Salary by Department (Cumulative Window Sums)
- **Features**: One-click challenge selection, schema viewer, execution timer (sub-millisecond latency), tabular result grid, solution toggle, and custom query execution.

---

## 🎯 How Daily Learning Works (Interactivity Guide)

Every topic in the curriculum is actionable and saves to `data/progress.json` instantly:

```
[✓] Tick Status  |  [🌱 Level 1: Need Practice ▾]  |  [ ⭐⭐⭐⭐⭐ ]  |  [ 💬 Inline Comment... ]
```

### 1. One-Click Tick Checkbox
- Click the circle checkbox on any topic to cycle through:
  - `Pending` (Gray ring)
  - `In Progress` (Amber clock)
  - `Completed` (Emerald checkmark + confetti celebration)
  - `Mastered` (Purple star)
- Marking completed automatically increments your **Daily Log**, updates your **90-Day Velocity**, and schedules the topic into the **Leitner Spaced Repetition Queue**.

### 2. Five Improvement Readiness Levels
Track your depth of understanding by choosing one of the 5 levels in the dropdown:
- **🌱 Level 1: Need Practice** — New topic or needs hands-on coding practice.
- **📖 Level 2: Theory Understood** — Understand the concept, but have not implemented it under interview pressure.
- **🔨 Level 3: Working Knowledge** — Can solve standard problems and explain typical architecture tradeoffs.
- **🎯 Level 4: Interview Ready** — Can write optimal code on a whiteboard and explain edge cases smoothly.
- **🏆 Level 5: Mastered & Deep** — Deep internal knowledge (CLR memory, lock contention, distribution nuances).

### 3. Inline Quick Comments
- Click the comment icon or text box next to any topic.
- Type your personal "Aha!" realization, tricky bug, or reminder (e.g., *"Remember to check for cycle start with 2(F+a) proof"*).
- Automatically saves upon blurring or pressing Enter.

### 4. Leitner 5-Box Spaced Repetition Engine
Permanent long-term memory retention through spaced retrieval practice:
- **Box 1**: 1 Day interval (Daily revision for new or forgotten topics)
- **Box 2**: 3 Days interval
- **Box 3**: 7 Days interval (Weekly reinforcement)
- **Box 4**: 14 Days interval (Bi-weekly recall)
- **Box 5**: 30 Days interval (Permanent retention)
- Review Deck allows flipping flashcards and grading your recall:
  - `Forgot`: Drops immediately back to **Box 1**.
  - `Struggled`: Moves back 1 box.
  - `Remembered`: Advances to next box.

### 5. Pomodoro Study Timer
- Built-in 25-minute Pomodoro timer in the top header.
- Synthesized Web Audio chimes on start and completion.
- Automatically logs study sessions and feeds the **90-Day GitHub Activity Heatmap**.

---

## 💾 Storage (File-Based, No Database)

All progress lives in a single JSON file:

```
data/progress.json
```

- Created automatically on first run, pre-seeded with all 157 topics.
- Every action (status tick, comment, review, study time) is written immediately. Writes are atomic (temp file + rename).
- Contents: `settings`, `topics`, `reviews` (spaced repetition logs), `daily_logs` (heatmap/streak data).
- **Backup**: copy `data/progress.json`. **Reset**: delete it (or use the reset action) and restart.
- Intended for local, single-user use (`npm run dev` / `npm run build && npm start`). It will not persist on serverless hosts like Vercel.
- The SQL Practice Console still uses a throwaway in-memory SQLite sandbox (`better-sqlite3`); it stores nothing.

---
## ⌨️ Keyboard Navigation Shortcuts

| Key | Destination / Action |
| :---: | :--- |
| `⌘K` or `Ctrl+K` | Open Global Command Palette |
| `1` | Switch to **Dashboard** |
| `2` | Switch to **DSA (LeetCode)** |
| `3` | Switch to **System Design** |
| `4` | Switch to **Backend Engineering** |
| `5` | Switch to **90-Day Calendar & Roadmap** |
| `6` | Switch to **Review Queue (Spaced Repetition)** |
| `7` | Switch to **Notes & Cheatsheets** |
| `8` | Switch to **Analytics & Telemetry** |
| `9` | Switch to **SQL Command Practice Console** |
| `Esc` | Close any active modal or search drawer |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start production server
npm run start -- -p 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
