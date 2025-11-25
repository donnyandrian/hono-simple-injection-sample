# 🛡️ Vulnerable App Suite: Injection Demo

This project is a collection of educational demonstrations illustrating common security vulnerabilities in web applications. It uses a modern stack (**Bun, Hono, TypeScript**) to show that modern tools do not automatically prevent bad coding practices.

**⚠️ WARNING: These applications are INTENTIONALLY VULNERABLE. Do not use this code in production.**

## 📂 Project Structure

This repository is divided into modules based on the type of vulnerability:

### 1. [SQL Injection (SQLi)](./src/sqli/README.md)
* **Location:** `./src/sqli`
* **Target:** PostgreSQL Database
* **Scenario:** A user search feature.
* **Goal:** Demonstrate how attackers can manipulate database queries to steal data.

### 2. [Shell Injection (Command Injection)](./src/shell/README.md)
* **Location:** `./src/shell`
* **Target:** Windows OS (cmd.exe)
* **Scenario:** A "Ping Service" that executes system commands.
* **Goal:** Demonstrate how attackers can chain commands to execute arbitrary code on the host OS.

### 3. [Server-Side Template Injection (SSTI)](./src/ssti/README.md)
* **Location:** `./src/ssti`
* **Target:** EJS Template Engine
* **Goal:** Inject malicious code into server-side templates to execute logic or commands.

### 4. [JSON Injection (Prototype Pollution)](./src/json-pollution/README.md)
* **Location:** `./src/json-pollution`
* **Target:** JavaScript Runtime (Object Prototype)
* **Goal:** Corrupt the global Object prototype to alter application logic (e.g., gain Admin access).

### 5. [XSS (Base64 Reflected)](./src/xss-base64/README.md)
* **Location:** `./src/xss-base64`
* **Target:** Browser DOM (innerHTML)
* **Goal:** Bypass text filters by encoding malicious scripts in Base64, then executing them upon decoding.

## 🌍 Global Prerequisites

Before running any module, ensure you have:

* [Bun](https://bun.sh/) (Runtime & Package Manager)
* [PostgreSQL](https://www.postgresql.org/) (Required for the SQLi module only)

## 🚀 How to Run

The process is the same for every module. Open your terminal in the project root:

1.  **Install Dependencies** (Required for each folder):
    ```bash
    bun install
    ```

2.  **Navigate** to the specific vulnerability folder:
    ```bash
    cd ./src/sqli  # or 'cd ./src/shell', or 'cd ./src/ssti'
    ```

3.  **Run the Server:**
    ```bash
    bun run index.ts
    ```

4.  **View the Demo:**
    Open the `index.html` file located inside that folder in your web browser.