# 🧬 JSON Injection (Prototype Pollution) Demo

* **Vulnerability:** Prototype Pollution
* **Target:** JavaScript Runtime (Object.prototype)
* **Port:** 3003

---

## 🐛 The Vulnerability

The application performs a **recursive merge** of user-provided JSON into a system object without checking for the special keys `__proto__`, `constructor`, or `prototype`.

```typescript
// DANGEROUS MERGE
const merge = (target, source) => {
    for (const key in source) {
        // No validation!
        if (typeof source[key] === 'object') {
             merge(target[key], source[key]);
        }
        // ...
    }
}
```

If an attacker sends a JSON with `__proto__`, they can modify the base `Object.prototype`. Since almost all objects in JavaScript inherit from this, the change affects the entire application.



---

## 💀 How to Attack

1.  Open `index.html`.
2.  Click **Check Admin Status**. You are currently a Guest.
3.  **The Attack:** Paste the following payload into the text area:
    ```json
    {
        "__proto__": {
            "isAdmin": true
        }
    }
    ```
4.  Click **🔴 Update (Vulnerable Merge)**.
5.  Click **Check Admin Status** again.

### The Result
You are now **ADMIN**.
Even though the code checks `const user = {}`, the prototype of that empty object now contains `isAdmin: true`.

---

## ✅ The Solution

1.  **Block Dangerous Keys:** Explicitly forbid `__proto__`, `constructor`, and `prototype` during merge.
2.  **Use `Object.create(null)`:** Create objects that don't have a prototype.
3.  **Use Safe Libraries:** Use `lodash.merge` (which has security patches) or `Object.assign` (shallow merge).

```typescript
// SAFE MERGE CHECK
if (key === '__proto__' || key === 'constructor') return;
```
