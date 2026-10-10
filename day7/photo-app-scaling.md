# SnapShare - Scaling Plan

## Assumptions

- 10,000,000 registered users, 10% active daily = 1,000,000 DAU.
- Each active user uploads 1 photo and views 50 feed pages per day.
- Photo: 2 MB. Thumbnail: 50 KB.
- 1 day ≈ 100,000 seconds.
- Peak traffic = 5 times average traffic.

## Estimates

- **Daily active users:** 10,000,000 × 10% = 1,000,000 DAU.
- **Uploads:** 1,000,000/day ÷ 100,000 ≈ 10 uploads per second (peak ≈ 50/s).
- **Feed views:** 1,000,000 × 50 = 50,000,000/day; 50,000,000 ÷ 100,000 ≈ 500 feed views per second (peak ≈ 2,500/s).
- **Storage:** 1,000,000 × (2 MB + 0.05 MB) = 2,050,000 MB ≈ 2.05 TB/day, or approximately 750 TB/year.

## Read-heavy or write-heavy?

SnapShare is very read-heavy, with about 50 feed views for every photo upload. We should make reads cheap using a CDN for images, a cache for feeds and read replicas for database queries. Uploads must remain reliable rather than requiring every background task to finish immediately.

## Where do the photos go?

Photos must NOT be stored directly in the database. Approximately 750 TB of new photo and thumbnail data per year would make the database huge, slow and expensive to back up.

Photo files should go into object storage, such as Amazon S3, which is designed for durable storage of large files. The database stores each photo's structured metadata, including its ID, owner, caption, upload time and file URL. The thumbnail URL can also be stored after the thumbnail is created.

## Architecture

    Mobile app / browser
           |
           | Photo files and thumbnails
           +----------------------------> CDN <------> Object storage
           |                                      (original photos
           |                                       and thumbnails)
           |
           | API calls (HTTPS, JSON)
           v
       Load balancer
           |
           +----> App server 1 ----+
           |                       |
           +----> App server 2 ----+----> Cache (Redis): feeds
           |                       |
           +----> App server 3 ----+
                   |        |
                   |        +--------> Queue ----> Thumbnail worker
                   |                                  |
                   |                                  +----> Object storage
                   |
                   v
              Primary DB
              (metadata)
                   |
                   | Replication
                   v
              Read replicas
              (feed queries)

## Components

- **CDN:** Serves photos and thumbnails from servers near users, making images load faster and reducing the load on the origin infrastructure.
- **Object storage:** Provides a durable and cost-effective home for hundreds of terabytes of original photos and thumbnails.
- **Load balancer:** Distributes incoming API requests across healthy application servers and stops sending traffic to failed servers.
- **App servers:** Stateless servers handle API requests and can be added as traffic grows.
- **Cache (Redis):** Keeps frequently requested, prepared feed data in memory so users can scroll quickly without querying the database for every request.
- **Primary database:** Acts as the source of truth for users, follows and photo metadata, and handles database writes.
- **Read replicas:** Handle suitable feed-related database queries, reducing the read load on the primary database.
- **Queue and thumbnail worker:** Process thumbnail-generation jobs in the background so the upload request does not have to wait for image processing to finish.

## Upload flow

1. The app sends a photo upload request through the load balancer to an application server.
2. The application server verifies the user's token and checks the file type and size.
3. The original photo is saved to object storage.
4. The application inserts a row containing the photo's metadata into the primary database.
5. The application adds a job, such as "make thumbnail for photo 123", to the message queue.
6. The application responds with `201 Created` once the original upload and required metadata have been saved successfully and the thumbnail job has been queued.
7. A worker takes the job, creates the 50 KB thumbnail, saves it to object storage and updates the photo's database row with the thumbnail URL.
8. The affected followers' cached feeds are invalidated or updated so the new photo can appear when their feeds are refreshed.

## Trade-offs

1. **Speed vs freshness:** Feeds come from the cache, so a new photo may take a few seconds to appear for followers. This is acceptable for a social app and greatly reduces database load.

2. **Simplicity vs speed of upload:** Thumbnails are created in the background. For a moment, a photo may not have a thumbnail, so the app can show a placeholder while processing finishes. Uploads remain responsive during busy periods.

3. **Cost vs performance:** A CDN and object storage cost money based on usage, but they help serve and store hundreds of terabytes more efficiently than relying entirely on our own application servers.

## Conclusion

SnapShare has approximately 1 million daily active users, 10 average uploads per second and 500 average feed views per second. It is very read-heavy and needs approximately 750 TB of new photo and thumbnail storage per year.

The key design decision is to separate large photo files from structured database data. Object storage holds the files, a CDN delivers them efficiently, and the database stores their metadata. Caching and read replicas help handle heavy feed traffic, while a queue and thumbnail worker move slow image processing into the background.
