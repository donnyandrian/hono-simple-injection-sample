import { Hono } from "hono";
import { cors } from "hono/cors";
import ejs from "ejs";

const app = new Hono();

app.use("*", cors());

// --- 1. VULNERABLE ENDPOINT ---
app.get("/render", async (c) => {
	const name = c.req.query("name") || "Guest";

	// [VULNERABILITY]
	// Here, we are constructing the template string by concatenating user input.
	// If the user inputs EJS syntax (e.g., "<%= 7*7 %>"), EJS will execute it.
	const template = `
        <h1>Welcome to our site!</h1>
        <p>Hello, ${name}!</p>
        <p>We are glad to have you here.</p>
    `;

	try {
		// We render the constructed string directly.
		// No data object is passed because the data is already "in" the string.
		const html = ejs.render(template);
		return c.html(html);
	} catch (error: any) {
		return c.html(`<h1>Template Error</h1><pre>${error.message}</pre>`, 500);
	}
});

// --- 2. SECURE ENDPOINT ---
app.get("/render-safe", async (c) => {
	const name = c.req.query("name") || "Guest";

	// [FIX STRATEGY]
	// 1. Define the template as a static string (or load from a file).
	// 2. Use placeholders (<%= var %>) for dynamic content.
	const template = `
        <h1>Welcome to our site!</h1>
        <p>Hello, <%= name %>!</p>
        <p>We are glad to have you here.</p>
    `;

	try {
		// [SAFE]
		// We pass the user input as a 'data' object (context).
		// EJS will treat 'name' as a variable, effectively escaping it.
		const html = ejs.render(template, { name: name });
		return c.html(html);
	} catch (error: any) {
		return c.html(`<h1>Template Error</h1><pre>${error.message}</pre>`, 500);
	}
});

export default {
	port: 3002, // Port 3002 for SSTI
	fetch: app.fetch,
};

console.log("SSTI App (EJS Target) running on http://localhost:3002");
