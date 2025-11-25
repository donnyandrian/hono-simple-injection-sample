# 🎭 XSS via Base64 Demo

* **Vulnerability:** Reflected Cross-Site Scripting (XSS)
* **Target:** DOM `innerHTML`
* **Port:** 3004

---

## 🐛 The Vulnerability

The application allows users to decode Base64 strings. It assumes the decoded content is safe and renders it directly into the HTML to support "Rich Text" decoding.

```javascript
// Backend returns raw decoded string
return c.json({ content: decoded }); 

// Frontend renders it unsafely
div.innerHTML = response.content;
```

Because Base64 looks like random characters (`PGltZy...`), it bypasses simple firewalls that look for `<script>`. However, once the browser decodes and renders it, the script executes.

---

## 💀 How to Attack

1.  Open `index.html`.
2.  **The Goal:** Execute `console.log("hacked")` silently.
3.  **The Payload:** We create a Base64 string from this HTML:
    ```html
    <img src=x onerror="console.log('hacked'); document.getElementById('result-area').innerHTML='NOTHING HEHE :)';">
    ```
4.  **Copy the payload** provided in the UI (Yellow Box).
5.  Paste it into the input and click **🔓 Decrypt (Unsafe)**.

### The Result
1.  The browser renders the decoded HTML.
2.  It sees the `<img>` tag with an invalid source (`x`).
3.  It fires the `onerror` event.
4.  **Action 1:** `console.log('hacked')` runs (Check your F12 Console).
5.  **Action 2:** The script quickly overwrites the result div with "NOTHING", creating a fake message.
6.  The standard Alert box might show the "NOTHING" text, confusing the user into thinking it just a dummy message, while the hack actually ran in the background.

---

## ✅ The Solution

**Sanitization.** Never trust user input, even if it comes in encoded.

1.  **Backend:** Convert special characters to HTML entities (`<` becomes `&lt;`).
2.  **Frontend:** Use `innerText` instead of `innerHTML` if you don't need rich text.

```typescript
// SAFE: Sanitize before returning
const safeDecoded = decoded.replace(/[&<>"'/]/g, ...);
```