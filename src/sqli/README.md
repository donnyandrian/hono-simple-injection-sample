# 💉 SQL Injection (SQLi) Demo

This module demonstrates a **SQL Injection** vulnerability targeting a **PostgreSQL** database.

* **Vulnerability:** SQL Injection (String Concatenation)
* **Target:** PostgreSQL
* **Technique:** Boolean-based injection / Tautology (`OR 1=1`)

---

## 💻 Setup & Run

1.  **Database Setup:**
    This project requires a `users` table in a PostgreSQL database.

    1.  **Create the Database & Table:**
        Open `psql` or your preferred database client and run the following SQL commands:

        ```sql
        -- 1. Create a new database
        CREATE DATABASE test_db;

        -- 2. Create the users table
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            comment TEXT
        );

        -- 3. Insert sample data (including a 'secret' user)
        INSERT INTO users (username, comment) VALUES
        ('admin', 'I am the site admin.'),
        ('alice', 'First user.'),
        ('bob', 'Second user.'),
        ('secret_user', 'This is a secret comment that should not be public.');
        ```

    2.  **Update Connection String:**
        Open the `index.ts` file and update the `postgres` connection object with your own database credentials.

        ```typescript
        // in index.ts
        const sql = postgres({
          host: 'localhost',
          port: 5432,
          database: 'test_db',
          username: 'your_postgres_user',    // <-- UPDATE THIS
          password: 'your_strong_password' // <-- UPDATE THIS
        });
        ```

2.  **Run the Server:**
    ```bash
    bun run index.ts
    ```
    The server will start on **http://localhost:3000**.

3.  **Open the Frontend:**
    Open `sqli/index.html` in your web browser.

---

## 🐛 The Vulnerability

The application takes a username input and concatenates it directly into a SQL query string.

```typescript
// DANGEROUS: Direct concatenation
const query = `SELECT username, comment FROM users WHERE username = '${username}'`;
const users = await sql.unsafe(query);
```

When an attacker inputs a specially crafted string, they can alter the logic of the SQL statement itself, bypassing the intended search filter.

---

## 💀 How to Attack

1.  Open the **frontend** (index.html).
2.  **Normal usage:** Enter `alice`. You get the result for Alice.
3.  **The Attack:** Enter the following payload:
    ```sql
    ' OR 1=1 --
    ```
4.  **Click Search.**

### The Result
The server constructs this query:
```sql
SELECT username, comment FROM users WHERE username = '' OR 1=1 --'
```

1.  `'`: Closes the username string.
2.  `OR 1=1`: Adds a condition that is ALWAYS TRUE.
3.  `--`: Comments out the rest of the query (preventing syntax errors).
4.  **Result:** The database returns **every single user**, including the hidden admin or secret accounts.

---

## ✅ The Solution

The fix is to **never** concatenate user input into queries. Instead, use **Parameterized Queries** (or Tagged Templates in `postgres-js`).

In our `/search-safe` endpoint, we use the template literal syntax provided by the driver:

```typescript
// SAFE: Parameterized Query
const users = await sql`
  SELECT username, comment 
  FROM users 
  WHERE username = ${username}
`;
```

The database driver treats `${username}` as raw data, not executable code. Even if you input `' OR 1=1 --`, the database will simply look for a user whose literal name is that string.
