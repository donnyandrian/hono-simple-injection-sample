import { Hono } from "hono";
import { cors } from "hono/cors";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);
const app = new Hono();

app.use("*", cors());

// --- 1. VULNERABLE ENDPOINT ---
app.get("/ping", async (c) => {
	const ip = c.req.query("ip");

	if (!ip) {
		return c.json({ error: "IP address is required" }, 400);
	}

	// [VULNERABILITY]
	// We are concatenating user input directly into a system shell command.
	// On Windows, 'ping' will run in cmd.exe.
	// An attacker can use '&' to chain commands.
	const command = `ping -n 1 ${ip}`;

	console.log(`[VULNERABLE] Executing: ${command}`);

	try {
		// exec runs the command in a shell (cmd.exe on Windows)
		const { stdout, stderr } = await execAsync(command);
		return c.json({ output: stdout, error: stderr });
	} catch (error: any) {
		return c.json({ output: error.stdout, error: error.message }, 500);
	}
});

// --- 2. SECURE ENDPOINT ---
app.get("/ping-safe", async (c) => {
	const ip = c.req.query("ip");

	if (!ip) {
		return c.json({ error: "IP address is required" }, 400);
	}

	// [FIX STRATEGY]
	// Strictly validate the input format using Regex.
	// We only allow IPv4 format (numbers and dots).
	const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

	if (!ipv4Regex.test(ip)) {
		return c.json(
			{
				error: "Invalid Input",
				message: "Malicious characters detected. Only IP addresses allowed.",
			},
			400
		);
	}

	// Now it's safe to use the input because we know it only contains numbers and dots.
	const command = `ping -n 1 ${ip}`;

	console.log(`[SAFE] Executing: ${command}`);

	try {
		const { stdout, stderr } = await execAsync(command);
		return c.json({ output: stdout, error: stderr });
	} catch (error: any) {
		return c.json({ output: error.stdout, error: error.message }, 500);
	}
});

export default {
	port: 3001, // Running on port 3001 to avoid conflict with SQLi app
	fetch: app.fetch,
};

console.log("Shell Injection App (Windows Target) running on http://localhost:3001");
