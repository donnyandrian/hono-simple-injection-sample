import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", cors());

// Helper to sanitize HTML tags (The Fix)
const sanitize = (str: string) => {
	return str.replace(/[&<>"'/]/g, (char) => {
		const map: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#x27;",
			"/": "&#x2F;",
		};
		return map[char];
	});
};

// --- ENDPOINTS ---

app.get("/decode", async (c) => {
	const encoded = c.req.query("data");
	const mode = c.req.query("mode") || "unsafe"; // 'unsafe' or 'safe'

	if (!encoded) {
		return c.json({ error: "No data provided" }, 400);
	}

	try {
		// 1. Decode the Base64 string to a UTF-8 string
		const decoded = Buffer.from(encoded, "base64").toString("utf-8");

		if (mode === "safe") {
			// [SAFE] Sanitize the string so HTML tags become harmless text
			// e.g., <script> becomes &lt;script&gt;
			const safeDecoded = sanitize(decoded);
			return c.json({ content: safeDecoded });
		} else {
			// [VULNERABLE] Return the raw decoded string containing HTML/Scripts
			return c.json({ content: decoded });
		}
	} catch (e: any) {
		return c.json({ error: "Invalid Base64 string" }, 400);
	}
});

export default {
	port: 3004, // Port 3004 for XSS
	fetch: app.fetch,
};

console.log("XSS Base64 App running on http://localhost:3004");
