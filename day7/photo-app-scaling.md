# SnapShare: Photo-Sharing App Scaling Plan

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and view feeds containing photos from people they follow.

The estimates use the following assumptions from the assignment:

- Registered users: 10,000,000
- Daily active users: 10% of registered users
- Photos uploaded per active user per day: 1
- Feed pages viewed per active user per day: 50
- Average original photo size: 2 MB
- Average thumbnail size per photo: 50 KB
- Seconds per day: approximately 100,000 for easy calculations
- Peak traffic: 5 times the average traffic
- A year has 365 days.
- Every uploaded photo has one thumbnail, and storage estimates exclude database records, backups, and other overhead.

## 2. Daily Active Users

Daily active users (DAU) are 10% of the 10 million registered users.

DAU = 10,000,000 × 10%

DAU = 1,000,000 users

Therefore, SnapShare has approximately 1 million daily active users.

## 3. Traffic and Storage Estimates

### A. Photo uploads per second

Each daily active user uploads one photo per day.

Daily uploads = 1,000,000 × 1

Daily uploads = 1,000,000 photos

Average uploads per second:

1,000,000 ÷ 100,000 ≈ 10 uploads/second

Peak uploads per second:

10 × 5 = 50 uploads/second

Therefore, SnapShare must handle approximately 10 uploads per second on average and 50 uploads per second at peak.

### B. Feed views per second

Each daily active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50

Daily feed views = 50,000,000 views

Average feed views per second:

50,000,000 ÷ 100,000 ≈ 500 feed views/second

Peak feed views per second:

500 × 5 = 2,500 feed views/second

Therefore, SnapShare must handle approximately 500 feed views per second on average and 2,500 feed views per second at peak.

### C. Photo storage per year

Each original photo occupies approximately 2 MB.

Daily original-photo storage:

1,000,000 × 2 MB = 2,000,000 MB

This is approximately 2,000 GB or 2 TB per day using decimal units.

Yearly original-photo storage:

2 TB × 365 = 730 TB per year

Each thumbnail occupies approximately 50 KB.

Daily thumbnail storage:

1,000,000 × 50 KB = 50,000,000 KB

This is approximately 50 GB per day.

Yearly thumbnail storage:

50 GB × 365 = 18,250 GB, or 18.25 TB per year

Total estimated storage per year:

730 TB + 18.25 TB = 748.25 TB per year

SnapShare therefore needs approximately 748.25 TB of new storage per year for original photos and thumbnails, before accounting for backups, replication, and other overhead.

## 4. Is the System Read-Heavy or Write-Heavy?

SnapShare is read-heavy because users view 50 feed pages per day but upload only one photo per day. This produces approximately 50 million feed views compared with 1 million uploads daily.

The design should therefore prioritize fast feed loading. A cache can store frequently requested feed data, a CDN can serve photos and thumbnails close to users, and database read replicas can handle read queries. Photo uploads still need a reliable write path through the application servers to object storage and the database.

## 5. Architecture Diagram

```text
                         +------------------+
                         |       DNS        |
                         +--------+---------+
                                  |
                                  v
+----------------+       +------------------+
| Users /        |------>| Load Balancer     |
| Mobile Clients | API   +--------+---------+
+-------+--------+                 |
        |                    +-----+-----+
        |                    |           |
        |                    v           v
        |              +-----------+ +-----------+
        |              | App Server| | App Server|
        |              |     1     | |     2     |
        |              +--+--+--+--+ +--+--+--+--+
        |                 |  |  |       |  |  |
        |                 |  |  +-------+  |  |
        |                 |  |             |  |
        |                 v  v             v  v
        |          +---------+       +-------------+
        |          |  Cache  |       | Message     |
        |          | (Redis) |       | Queue       |
        |          +---------+       +------+------+
        |                                    |
        |                                    v
        |                             +--------------+
        |                             | Thumbnail    |
        |                             | Worker       |
        |                             +------+-------+
        |                                    |
        |                                    v
        |                           +------------------+
        |                           | Object Storage   |
        |                           | Originals and    |
        |                           | Thumbnails       |
        |                           +------------------+
        |
        | Static files and photo delivery
        v
+------------------+
| CDN              |
+--------+---------+
         |
         v
   Users receive
   photos/thumbnails


 App Servers ----writes----> +------------------+
                             | Primary Database |
                             +--------+---------+
                                      |
                                      | Replication
                                      v
                             +------------------+
                             | Read Replica     |
                             +------------------+
                                      ^
                                      |
                               Feed read queries
```

## 6. Components and the Problems They Solve

1. **DNS:** Translates SnapShare's domain name into the address needed to reach the service.
2. **Users and mobile clients:** Allow users to upload photos and browse feeds.
3. **CDN:** Serves photos, thumbnails and other cacheable static files from locations closer to users, reducing latency and origin-server traffic.
4. **Load balancer:** Distributes API requests among healthy application servers and avoids sending traffic to unhealthy servers.
5. **Application servers:** Validate requests, check permissions, manage feed operations and coordinate database, cache and storage access.
6. **Redis cache:** Stores frequently requested feed data so the application does not need to query the database for every feed request.
7. **Primary database:** Stores structured records such as users, follows, photo metadata and photo ownership.
8. **Read replica:** Handles suitable database read queries to reduce the load on the primary database.
9. **Object storage:** Stores original photos and generated thumbnails without putting large image files directly inside database rows.
10. **Message queue:** Holds thumbnail-generation jobs so uploads do not have to wait for all image processing to finish.
11. **Thumbnail worker:** Processes queued jobs, creates smaller image versions and saves the thumbnails to object storage.

## 7. Step-by-Step Photo Upload Flow

1. A user selects a photo in the SnapShare app and submits it over HTTPS.
2. The load balancer routes the API request to a healthy application server.
3. The application server authenticates the user, validates the request and checks upload permissions and file limits.
4. The original photo is uploaded to object storage, directly or through a controlled upload URL.
5. The application stores the photo's metadata in the primary database, including the owner, storage key, upload time and processing status.
6. The application adds a thumbnail-generation job to the message queue.
7. The application responds to the user that the upload has been accepted or completed, according to the upload workflow.
8. A worker retrieves the queued job and generates a smaller thumbnail from the original photo.
9. The worker saves the thumbnail in object storage and updates the photo's processing status in the database.
10. The CDN can serve the original photo and thumbnail when users view them. The application invalidates or updates affected cached feed data when necessary.

The queue allows thumbnail processing to happen in the background, keeping the upload request responsive.

## 8. Trade-Offs

### Trade-off 1: Faster reads versus fresh data

Caching feeds and using read replicas reduce database load and improve performance. However, cached feeds or replicas may briefly show outdated information. SnapShare should invalidate affected cache entries after relevant changes and accept short delays only where they are reasonable.

### Trade-off 2: Reliability versus cost

Multiple application servers, database replicas, durable queues and replicated object storage improve reliability but increase infrastructure costs. SnapShare should add redundancy for important components and scale resources according to measured demand.

### Trade-off 3: Processing uploads immediately versus processing in the background

Generating thumbnails during the upload request simplifies the workflow but makes users wait longer. A queue and worker improve responsiveness, but introduce more components to monitor and require retry handling for failed jobs.

### Trade-off 4: Database storage versus object storage

Storing image files inside the database can simplify some transactions but makes the database much larger and can make backups and scaling more expensive. Storing images in object storage while keeping metadata in the database separates the two workloads, but the application must manage storage keys, permissions and consistency between the records and the files.

## 9. Conclusion

SnapShare is a read-heavy application with approximately 1 million daily active users, 10 average photo uploads per second, 500 average feed views per second and approximately 748.25 TB of new original-photo and thumbnail storage per year under the stated assumptions.

A scalable design uses a CDN for image delivery, a load balancer and multiple application servers for API traffic, Redis for frequent reads, a primary database with a read replica for structured data, object storage for image files, and a message queue with workers for thumbnail generation. Monitoring, backups, access controls and appropriate failure handling are also important as the system grows.
