# Library REST API Design

## Overview

The Library API allows users to view, create, update, search for, and delete books. It uses REST principles and JSON for request and response data.

**Base URL:** `https://api.example.com`

## Endpoints

### 1. List all books

* **Method:** GET
* **Path:** `/books`
* **Description:** Returns a list of all books in the library.
* **Success status:** `200 OK`
* **Example request body:** None required.

### 2. Get one book

* **Method:** GET
* **Path:** `/books/{id}`
* **Description:** Returns the details of a book with the specified ID.
* **Success status:** `200 OK`
* **Example request body:** None required.
* **Example path:** `/books/1`

### 3. Create a book

* **Method:** POST
* **Path:** `/books`
* **Description:** Adds a new book to the library.
* **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publishedYear": 1958
}
```

* **Success status:** `201 Created`

### 4. Replace a book

* **Method:** PUT
* **Path:** `/books/{id}`
* **Description:** Replaces the editable details of an existing book.
* **Example request body:**

```json
{
  "title": "The River Between",
  "author": "Ngugi wa Thiong'o",
  "publishedYear": 1965
}
```

* **Success status:** `200 OK`

### 5. Update selected book details

* **Method:** PATCH
* **Path:** `/books/{id}`
* **Description:** Updates selected fields of an existing book without replacing all its details.
* **Example request body:**

```json
{
  "publishedYear": 1965
}
```

* **Success status:** `200 OK`

### 6. Delete a book

* **Method:** DELETE
* **Path:** `/books/{id}`
* **Description:** Deletes the book with the specified ID.
* **Success status:** `204 No Content`
* **Example request body:** None required.
* **Example path:** `/books/1`

### 7. Find books by author

* **Method:** GET
* **Path:** `/books?author=Chinua%20Achebe`
* **Description:** Returns books written by the specified author. The author is supplied as a query parameter.
* **Success status:** `200 OK`
* **Example request body:** None required.

## Error Responses

### 400 Bad Request

**Meaning:** The request contains invalid data or is missing required information.

**Example:** A client tries to create a book without providing a title.

Example response:

```json
{
  "error": "Bad Request",
  "message": "The title field is required."
}
```

### 404 Not Found

**Meaning:** The requested book or resource does not exist.

**Example:** A client requests `GET /books/9999`, but no book with ID `9999` exists.

Example response:

```json
{
  "error": "Not Found",
  "message": "The requested book was not found."
}
```

## Summary

The API uses HTTP methods to perform different operations on books:

* **GET** retrieves books.
* **POST** creates a book.
* **PUT** replaces a book's editable details.
* **PATCH** updates selected fields.
* **DELETE** removes a book.

The API uses JSON for request and response data and HTTP status codes to communicate the result of each request.
