import { Hono } from "hono";
import { cors } from "hono/cors";
import postgres from "postgres"; // Driver postgres-js

const app = new Hono();

// Set up CORS so the frontend can access
app.use("/search", cors());
app.use("/search-safe", cors());

// Replace with your PostgreSQL database connection
const sql = postgres({
	host: "localhost",
	port: 5433,
	database: "test_db",
	username: "postgres",
	password: "postgres",
});

console.log("Connected to database...");

// !!! VULNERABLE ENDPOINT !!!
app.get("/search", async (c) => {
	const username = c.req.query("username");

	if (!username) {
		return c.json({ error: "Username is required" }, 400);
	}

	// --- DANGER: MAKING DYNAMIC QUERIES ---
	// The 'postgres-js' driver is smart. To make an injection,
	// we must explicitly use 'sql.unsafe()'.
	// This is the way to tell "I know this is dangerous, but do it anyway".
	const query = `SELECT username, comment FROM users WHERE username = '${username}'`;
	// --------------------------------------------------------------------

	console.log(`Executing query: ${query}`);

	try {
		// We call .unsafe() to force execution of the raw string
		const users = await sql.unsafe(query);
		return c.json(users);
	} catch (err: any) {
		console.error(err);
		return c.json({ error: "Internal Server Error", message: err.message }, 500);
	}
});

// === THIS IS A SAFE ENDPOINT ===
app.get("/search-safe", async (c) => {
	const username = c.req.query("username");

	if (!username) {
		return c.json({ error: "Username is required" }, 400);
	}

	// --- SAFE: USING PARAMETERIZED QUERIES (Tagged Templates) ---
	// Note: There is no .unsafe()
	// 'postgres-js' automatically sanitizes variables
	// used in ${...} when used in sql``
	console.log(`Executing safe query for: ${username}`);

	try {
		const users = await sql`
			SELECT username, comment 
			FROM users 
			WHERE username = ${username}
		`;
		// The user input is treated as DATA, not a COMMAND
		return c.json(users);
	} catch (err: any) {
		console.error(err);
		return c.json({ error: "Internal Server Error", message: err.message }, 500);
	}
});

// Hono server is running on top of Bun
export default {
	port: 3000,
	fetch: app.fetch,
};

console.log("Server vulnerable (Hono) running at http://localhost:3000");
