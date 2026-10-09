# School Database Design

## Overview

This database stores students, courses, enrolments and grades. It uses a relational database design with three tables: `students`, `courses` and `enrolments`.

## 1. Students Table

The `students` table stores information about each student.

| Column  | Data type | Description                                       |
| ------- | --------- | ------------------------------------------------- |
| `id`    | INTEGER   | Primary key that uniquely identifies each student |
| `name`  | TEXT      | Student's name; required                          |
| `email` | TEXT      | Student's email; required and unique              |

The primary key ensures that every student has a unique identifier. The `NOT NULL` constraint requires a name and email, while `UNIQUE` prevents two students from sharing the same email address.

## 2. Courses Table

The `courses` table stores information about available courses.

| Column        | Data type | Description                                      |
| ------------- | --------- | ------------------------------------------------ |
| `id`          | INTEGER   | Primary key that uniquely identifies each course |
| `course_name` | TEXT      | Course name; required and unique                 |
| `description` | TEXT      | Description of the course                        |

The primary key identifies each course. The `NOT NULL` constraint requires a course name, and `UNIQUE` prevents duplicate course names.

## 3. Enrolments Table

The `enrolments` table records which students take which courses and the grades they receive.

| Column       | Data type | Description                                               |
| ------------ | --------- | --------------------------------------------------------- |
| `id`         | INTEGER   | Primary key for each enrolment                            |
| `student_id` | INTEGER   | Foreign key referencing `students.id`                     |
| `course_id`  | INTEGER   | Foreign key referencing `courses.id`                      |
| `grade`      | TEXT      | Student's grade; required, with a default of `Not graded` |

The foreign keys ensure that each enrolment refers to an existing student and course. The `UNIQUE (student_id, course_id)` constraint prevents a student from enrolling in the same course more than once.

The `ON DELETE CASCADE` rule removes related enrolments if their student or course is deleted.

## 4. Relationships

### One-to-many relationships

One student can have many enrolments, but each enrolment belongs to one student. The `student_id` foreign key in the enrolments table establishes this relationship.

One course can have many enrolments, but each enrolment refers to one course. The `course_id` foreign key establishes this relationship.

### Many-to-many relationship

Students and courses have a many-to-many relationship because one student can take several courses, and one course can have several students.

The `enrolments` table acts as a join table between `students` and `courses`. It connects their IDs and stores the grade for each student-course combination. Without this join table, the design would make it harder to manage multiple course enrolments correctly.

## 5. Recommended Index

I would add an index on `enrolments(course_id)` to make it faster to find students enrolled in a particular course and to retrieve enrolments for course-related queries.

Example SQL:

`CREATE INDEX idx_enrolments_course_id ON enrolments(course_id);`

Indexes improve searches but require additional storage and can make inserts, updates and deletes slightly slower because the index must also be maintained.

## 6. SQL or NoSQL?

I would choose a relational SQL database such as SQLite or PostgreSQL for this school system. The data has a clear structure, and students, courses and enrolments have important relationships. SQL supports primary keys, foreign keys, unique constraints and joins, which help maintain accurate records and prevent duplicate enrolments. It also makes it straightforward to calculate the number of students per course and retrieve grades. A document-based NoSQL database could be useful for more flexible data structures, but a relational database is a suitable choice for this structured school system.
