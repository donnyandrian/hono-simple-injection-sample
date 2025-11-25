# 🛡️ Vulnerable App Suite: Injection Demo

This project is a collection of educational demonstrations illustrating common security vulnerabilities in web applications. It uses a modern stack (**Bun, Hono, TypeScript**) to show that modern tools do not automatically prevent bad coding practices.

**⚠️ WARNING: These applications are INTENTIONALLY VULNERABLE. Do not use this code in production.**

## 📂 Project Structure

This repository is divided into modules based on the type of vulnerability:

### 1. [SQL Injection (SQLi)](./src/sqli/README.md)
* **Location:** `/sqli`
* **Target:** PostgreSQL Database
* **Scenario:** A user search feature.
* **Goal:** Demonstrate how attackers can manipulate database queries to steal data.

### 2. [Shell Injection (Command Injection)](./src/shell/README.md)
* **Location:** `/shell`
* **Target:** Windows OS (cmd.exe)
* **Scenario:** A "Ping Service" that executes system commands.
* **Goal:** Demonstrate how attackers can chain commands to execute arbitrary code on the host OS.

## 🌍 Global Prerequisites

Before running any module, ensure you have:

* [Bun](https://bun.sh/) (Runtime & Package Manager)
* [PostgreSQL](https://www.postgresql.org/) (Required for the SQLi module only)

## 🚀 How to Run

1.  **Install Dependencies:**
    ```bash
    bun install
    ```
2.  **Navigate to the specific folder and follow the `README.md` inside that folder.**

    - **For SQL Injection:**
        ```bash
        cd ./src/sqli
        # Follow instructions in sqli/README.md
        ```

    - **For Shell Injection:**
        ```bash
        cd ./src/shell
        # Follow instructions in shell/README.md
        ```