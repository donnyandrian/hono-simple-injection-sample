# 📄 Server-Side Template Injection (SSTI) Demo

* **Vulnerability:** SSTI (Unsafe Template Concatenation)
* **Target Engine:** EJS (Embedded JavaScript)
* **Technique:** Template Logic Injection / RCE
* **Port:** 3002

---

## 🐛 The Vulnerability

The application constructs a template string by concatenating user input *before* passing it to the render engine.

```typescript
// DANGEROUS: Mixing data into the template string structure
const template = `<h1>Hello, ${username}!</h1>`;
const html = ejs.render(template);
```

Because `username` becomes part of the template structure, if the user inputs EJS syntax tags (`<%= %>`), the engine executes them.

---

## 💀 How to Attack

1.  Open the **frontend** (index.html).
2.  **Normal usage:** Enter `Alice`. It says "Hello, Alice!".
3.  **The Attack (Proof of Concept):** Enter the following payload:
    ```javascript
    <%= 7 * 7 %>
    ```
4.  **Click Generate (Unsafe).**

### The Result
Instead of saying "Hello, <%= 7 * 7 %>!", the server calculates the math and returns:
> **Hello, 49!**

### Why is this dangerous?
If an attacker can execute math, they can execute JavaScript. In a Node.js environment, this can lead to Remote Code Execution (RCE).
*Advanced Payload:* `<%= process.env.PATH %>` (Reveals server environment variables).

---

## ✅ The Solution

Never mix data into the template string. Pass data as a **Context Object**.

```typescript
// SAFE: Template is static. Data is passed separately.
const template = `<h1>Hello, <%= name %>!</h1>`;
const html = ejs.render(template, { name: username });
```