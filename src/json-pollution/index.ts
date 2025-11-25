import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", cors());

// A dummy "database" or global state for application settings
let globalConfig: any = {
	theme: "light",
	showSidebar: true,
};

// --- HELPER FUNCTIONS ---

// [VULNERABLE] Recursive merge without key validation
const unsafeMerge = (target: any, source: any) => {
	for (const key in source) {
		if (source[key] && typeof source[key] === "object") {
			if (!target[key]) target[key] = {};
			unsafeMerge(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
	return target;
};

// [SAFE] Recursive merge with key blocking
const safeMerge = (target: any, source: any) => {
	for (const key in source) {
		// SECURITY CHECK: Block dangerous keys
		if (key === "__proto__" || key === "constructor" || key === "prototype") {
			continue; // Skip this key
		}

		if (source[key] && typeof source[key] === "object") {
			if (!target[key]) target[key] = {};
			safeMerge(target[key], source[key]);
		} else {
			target[key] = source[key];
		}
	}
	return target;
};

// --- ENDPOINTS ---

// 1. VULNERABLE ENDPOINT
app.post("/update-settings", async (c) => {
	try {
		const newSettings = await c.req.json();

		// Merge user input into the global config
		unsafeMerge(globalConfig, newSettings);

		return c.json({ message: "Settings updated", currentConfig: globalConfig });
	} catch (e: any) {
		return c.json({ error: e.message }, 400);
	}
});

// 2. SAFE ENDPOINT
app.post("/update-settings-safe", async (c) => {
	try {
		const newSettings = await c.req.json();

		// Merge using the safe function
		safeMerge(globalConfig, newSettings);

		return c.json({ message: "Settings updated safely", currentConfig: globalConfig });
	} catch (e: any) {
		return c.json({ error: e.message }, 400);
	}
});

// 3. ADMIN CHECK (The Victim)
// This endpoint checks if the current user is an admin.
// In a real app, this would check a database or session.
// Here, we check a fresh, empty object.
app.get("/check-admin", (c) => {
	const userSession: any = {}; // A fresh object for the current user

	// NORMALLY: This is undefined and false.
	// IF POLLUTED: Object.prototype.isAdmin will be true, so userSession.isAdmin becomes true.
	if (userSession.isAdmin) {
		return c.json({
			isAdmin: true,
			message: "⚠️ DANGER: You are recognized as ADMIN due to pollution!",
		});
	} else {
		return c.json({
			isAdmin: false,
			message: "You are a standard Guest user.",
		});
	}
});

// 4. RESET (Cleanup)
app.post("/reset", (c) => {
	globalConfig = { theme: "light", showSidebar: true };
	// Clean up the pollution for the next test
	delete (Object.prototype as any).isAdmin;
	return c.json({ message: "System reset. Pollution cleared." });
});

export default {
	port: 3003, // Port 3003 for JSON Pollution
	fetch: app.fetch,
};

console.log("JSON Pollution App running on http://localhost:3003");
