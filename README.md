# SQL Injection (SQLi) Demo with Hono, Bun, and PostgreSQL

This is a simple full-stack "User Search" application built with a modern, fast stack (Hono, Bun, TypeScript, and `postgres-js`).

The primary purpose of this project is to **intentionally demonstrate a critical SQL Injection vulnerability**. It provides a clear, hands-on example of:

1.  How an SQLi attack is performed.
2.  Why it works and the damage it can cause.
3.  The correct, modern way to fix it using parameterized queries.

> ### ⚠️ **Security Warning**
>
> **This application is intentionally insecure. DO NOT use any of the vulnerable code patterns in this project in a production environment.**
>
> This code is for educational and demonstration purposes only.

-----

## 🚀 Tech Stack

  * **Runtime:** [Bun](https://bun.sh/)
  * **Backend:** [Hono](https://hono.dev/) (Minimalist, fast web framework)
  * **Language:** TypeScript
  * **Database:** PostgreSQL
  * **Driver:** [postgres-js](https://github.com/porsager/postgres) (High-performance, modern Postgres driver)
  * **Frontend:** Vanilla HTML & JavaScript

-----

## 💻 1. Setup (Prerequisites)

Before you begin, ensure you have the following tools installed on your system:

1.  **Bun:** [Installation Guide](https://bun.sh/docs/installation)
2.  **PostgreSQL:** [Official Downloads](https://www.postgresql.org/download/). You also need a database client like `psql` or pgAdmin.

-----

## 🛠️ 2. Installation

1.  **Clone the repository** (or create the files from the previous chat history).

    ```bash
    git clone https://github.com/donnyandrian/hono-simple-injection-sample.git
    cd hono-simple-injection-sample
    ```

2.  **Install dependencies** using Bun.

    ```bash
    bun install
    ```

    This will install `hono` and `postgres`.

-----

## ⚙️ 3. Configuration (Database)

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

-----

## 🚀 4. Run the Application

1.  **Start the Backend Server:**
    Run the `index.ts` file using Bun.

    ```bash
    bun run src/index.ts
    ```

    You should see `Server vulnerable (Hono) running at http://localhost:3000` in your console.

2.  **Open the Frontend:**
    In your file explorer, find the `index.html` file and **open it directly in your web browser**.

-----

## 🐛 5. Vulnerability Test (The Attack)

We will now test the two endpoints: the normal one and the vulnerable one.

### Test 1: Normal Search

1.  In the text box, type `alice`.
2.  Click "Search".
3.  **Result:** You will see the data for 'alice' only.
    ```json
    [
      {
        "username": "alice",
        "comment": "First user."
      }
    ]
    ```
4.  **In your backend console:** You will see the clean query:
    `Executing query: SELECT username, comment FROM users WHERE username = 'alice'`

### Test 2: The SQL Injection Attack

1.  In the text box, type the following payload: `' OR 1=1 --`
2.  Click "Search".
3.  **Result:** You will see **ALL USERS** from the database, including `secret_user`\!
    ```json
    [
      {
        "username": "admin",
        "comment": "I am the site admin."
      },
      {
        "username": "alice",
        "comment": "First user."
      },
      {
        "username": "bob",
        "comment": "Second user."
      },
      {
        "username": "secret_user",
        "comment": "This is a secret comment that should not be public."
      }
    ]
    ```

### Why Did This Work?

The vulnerable code in `index.ts` is in the `/search` endpoint:

```typescript
// --- VULNERABLE CODE ---
const query = `SELECT username, comment FROM users WHERE username = '${username}'`;
// ...
const users = await sql.unsafe(query); // We force the raw string to execute
```

When you entered the payload (`' OR 1=1 --`), the server built the following **malicious SQL string**:

```sql
SELECT username, comment FROM users WHERE username = '' OR 1=1 --'
```

Let's break this down:

  * `username = ''`: The first `'` from your payload closes the string, so the app searches for an empty username.
  * `OR 1=1`: This is the core of the attack. You **injected a new SQL command**. Since `1=1` is *always true*, the `WHERE` clause (`WHERE (false) OR (true)`) becomes true for **every single row**.
  * `--`: This is a SQL comment. It tells the database to ignore the rest of the query, which cleverly gets rid of the final, trailing `'` that would have caused a syntax error.

-----

## ✅ 6. The Patch & Solution

The fix for SQL Injection is to **never build queries by concatenating strings**. Always use **Parameterized Queries** (also called Prepared Statements).

This means you provide the SQL *query template* and the *user data* separately. The database driver then safely inserts the data, ensuring it is treated as text (data) and **not** as an executable command.

### The Fix: `postgres-js` Tagged Templates

The `postgres-js` library makes this fix extremely easy and elegant using [Tagged Template Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates).

This is the code for the `/search-safe` endpoint:

```typescript
// --- SAFE CODE ---
app.get('/search-safe', async (c) => {
  const username = c.req.query('username');
  // ...
  try {
    // This is SAFE. 'sql`...`' is a tagged template.
    // The driver cleans the ${username} variable.
    // It is treated as DATA, not a COMMAND.
    const users = await sql`
      SELECT username, comment 
      FROM users 
      WHERE username = ${username}
    `;
    return c.json(users);
  }
  // ...
});
```

### Verify the Fix

1.  Open `index.html`.

2.  Find the `fetch` line (around line 43) and change the URL from `/search` to `/search-safe`.

    ```javascript
    // Change this:
    // const response = await fetch(`http://localhost:3000/search?username=${username}`);

    // To this:
    const response = await fetch(`http://localhost:3000/search-safe?username=${username}`);
    ```

3.  Save the file and refresh the page in your browser.

4.  Enter the attack payload again: `' OR 1=1 --`

5.  Click "Search".

**Result:** You will see "User not found" or an empty array `[]`.

**Why is it fixed?** The database driver did *not* execute your `OR 1=1` command. Instead, it safely searched for a user whose *literal name* is the string `"' OR 1=1 --"`. Since no such user exists, it correctly returned no results. The attack was neutralized.
