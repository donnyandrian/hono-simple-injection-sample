# 🐚 Shell Injection (Command Injection) Demo

This module demonstrates a **Command Injection** vulnerability targeting the **Windows** operating system.

* **Vulnerability:** OS Command Injection
* **Target OS:** Windows (uses `cmd.exe` syntax)
* **Technique:** Chaining commands using the `&` operator.

---

## 💻 Setup & Run

1.  **Run the Server:**
    ```bash
    bun run index.ts
    ```
    The server will start on **http://localhost:3001**.

2.  **Open the Frontend:**
    Open `shell/index.html` in your web browser.

---

## 🐛 The Vulnerability

The application takes a user's IP address and runs the `ping` command on the server using `child_process.exec`.

```typescript
// DANGEROUS: Direct concatenation passed to shell
const command = `ping -n 1 ${ip}`;
exec(command, ...);
```

On Windows, this executes inside `cmd.exe`. The `&` character is a command separator, allowing multiple commands to run sequentially.

---

## 💀 How to Attack

1.  Open the **frontend** (index.html).
2.  **Normal usage:** Enter `127.0.0.1`. You get the ping result.
3.  **The Attack:** Enter the following payload:
    ```cmd
    127.0.0.1 & dir
    ```
4.  **Click Ping.**

### The Result
The server constructs this command:
```cmd
ping -n 1 127.0.0.1 & dir
```

1.  It pings localhost.
2.  **THEN** it executes `dir` (directory listing).
3.  The backend returns the combined output, allowing you to browse the server's file system.

**Other payloads to try:**
* `127.0.0.1 & whoami` (Reveal the server user)
* `127.0.0.1 & type index.ts` (Read the source code)

---

## ✅ The Solution

There are two main ways to fix this:

1.  **Avoid the Shell (Best):** Use `execFile` or `spawn`. These functions pass arguments as an array and do not spawn a shell (like `cmd.exe`), making command chaining impossible.
2.  **Strict Input Validation (Used here):** If you must use a shell, validate the input against a strict Allowlist (Regex).

In our `/ping-safe` endpoint, we use Regex to ensure the input is **only** an IP address:

```typescript
const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

if (!ipv4Regex.test(ip)) {
   throw new Error("Invalid Input");
}
```

Try using the attack payload `127.0.0.1 & dir` in the **🟢 Secure Ping** box. It will be rejected immediately.