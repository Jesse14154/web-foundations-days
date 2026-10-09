PRAGMA foreign_keys = ON;

-- ==========================================
-- 1. REMOVE OLD TABLES
-- ==========================================

DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;


-- ==========================================
-- 2. CREATE THE STUDENTS TABLE
-- ==========================================

CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);


-- ==========================================
-- 3. CREATE THE COURSES TABLE
-- ==========================================

CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE,
    description TEXT
);


-- ==========================================
-- 4. CREATE THE ENROLMENTS TABLE
-- ==========================================

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT NOT NULL DEFAULT 'Not graded',

    FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    UNIQUE (student_id, course_id)
);


-- ==========================================
-- 5. CREATE AN INDEX
-- ==========================================

CREATE INDEX idx_enrolments_course_id
ON enrolments(course_id);


-- ==========================================
-- 6. INSERT STUDENTS
-- ==========================================

INSERT INTO students (id, name, email) VALUES
(1, 'Sherleen Atieno', 'sherleen@gmail.com'),
(2, 'Rowland Anagwe', 'rowland@gmail.com'),
(3, 'Stephany Aicia', 'stephany@gmail.com'),
(4, 'Jesse Jackson', 'jesse@gmail.com');


-- ==========================================
-- 7. INSERT COURSES
-- ==========================================

INSERT INTO courses (id, course_name, description) VALUES
(1, 'Mathematics', 'Study of numbers and problem solving'),
(2, 'Computer Science', 'Study of computers and programming'),
(3, 'Biology', 'Study of living organisms');


-- ==========================================
-- 8. INSERT ENROLMENTS
-- Rowland (ID 2) has no enrolments to test Query 4.
-- ==========================================

INSERT INTO enrolments
    (id, student_id, course_id, grade)
VALUES
(1, 1, 1, 'A'),
(2, 1, 3, 'B'),
(3, 3, 1, 'B'),
(4, 3, 2, 'A'),
(5, 4, 2, 'C'),
(6, 4, 3, 'B');


-- ==========================================
-- QUERY 1:
-- Find all courses taken by Sherleen Atieno.
-- ==========================================

SELECT
    students.name AS student_name,
    courses.course_name,
    enrolments.grade
FROM students
JOIN enrolments
    ON students.id = enrolments.student_id
JOIN courses
    ON enrolments.course_id = courses.id
WHERE students.name = 'Sherleen Atieno'
ORDER BY courses.course_name;


-- ==========================================
-- QUERY 2:
-- Find all students enrolled in Computer Science.
-- ==========================================

SELECT
    students.name AS student_name,
    students.email,
    courses.course_name
FROM students
JOIN enrolments
    ON students.id = enrolments.student_id
JOIN courses
    ON enrolments.course_id = courses.id
WHERE courses.course_name = 'Computer Science'
ORDER BY students.name;


-- ==========================================
-- QUERY 3:
-- Count the students enrolled in each course.
-- ==========================================

SELECT
    courses.course_name,
    COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments
    ON courses.id = enrolments.course_id
GROUP BY courses.id, courses.course_name
ORDER BY courses.course_name;


-- ==========================================
-- QUERY 4:
-- Find students who have no enrolments.
-- ==========================================

SELECT
    students.id,
    students.name,
    students.email
FROM students
LEFT JOIN enrolments
    ON students.id = enrolments.student_id
WHERE enrolments.id IS NULL
ORDER BY students.name;


-- ==========================================
-- QUERY 5:
-- Update the grade for Sherleen Atieno's Mathematics enrolment.
-- ==========================================

UPDATE enrolments
SET grade = 'A+'
WHERE student_id = (
    SELECT id
    FROM students
    WHERE name = 'Sherleen Atieno'
)
AND course_id = (
    SELECT id
    FROM courses
    WHERE course_name = 'Mathematics'
);


-- ==========================================
-- VERIFY QUERY 5:
-- Display the updated grade.
-- ==========================================

SELECT
    students.name AS student_name,
    courses.course_name,
    enrolments.grade AS updated_grade
FROM enrolments
JOIN students
    ON enrolments.student_id = students.id
JOIN courses
    ON enrolments.course_id = courses.id
WHERE students.name = 'Sherleen Atieno'
AND courses.course_name = 'Mathematics';