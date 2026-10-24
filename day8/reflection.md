# Day 8 Reflection

The most difficult concept in this course was understanding how database transactions prevent two customers from buying the same seat at the same time. At first, checking whether a seat was available seemed sufficient. I learned that two requests can check the same seat almost simultaneously, creating a race condition. I improved my understanding by studying atomic conditional updates, transactions, row-level locking, and unique constraints. I also learned why a cached seat map cannot be trusted as the final authority for a purchase.

The feedback on my TicketHub assignment showed me that a design document must be complete, not just have a good beginning. My earlier submissions did not clearly present all the database tables, the double-booking prevention strategy, the architecture diagram, and the trade-offs. To improve the design, I reorganised the document into clear sections, added related tables and their relationships, explained the reservation transaction, and described how the waiting room, cache, application servers, database, and background workers work together.

Next, I want to learn PostgreSQL and Node.js with Express so I can turn this design into a working application. I also want to practise database transactions, API testing, and load testing. Building a small prototype would help me verify that competing requests cannot reserve the same seat and that payment retries do not create duplicate orders.

