# cdnX -  DEMO PAGE - https://coreyadam8.github.io/cdnX/

**Smart JavaScript CDN loader with automatic fallback, resilience, and customization.**

cdnX allows you to load external JavaScript libraries dynamically at runtime, trying multiple CDNs in fallback order until one succeeds — ensuring uptime and flexibility in production environments.

---

## 🚀 Features

- 🔄 **Multi-CDN fallback**: Automatically retries across CDNs on failure
- 🧠 **Custom CDN registration**: Add, prioritize, or remove CDNs at runtime
- ✅ **Load status feedback**: Programmatically track which CDN succeeded
- 📦 **Zero dependencies**: Lightweight, vanilla JS
- 🛠️ **CDN diagnostic GUI ready** (optional)

---

## 📦 Supported CDNs (default)

- [jsDelivr](https://www.jsdelivr.com/)
- [unpkg](https://unpkg.com/)
- [cdnjs](https://cdnjs.com/)
- [skypack](https://www.skypack.dev/)

---

## 🔧 Usage

```html
<script src="https://unpkg.com/cdnx@1.0.0/dist/cdnx.min.js"></script>
<script>
  cdnX.loadLibrary('lodash', '4.17.21', 'lodash.min.js', {
    cdnOrder: ['jsdelivr', 'unpkg', 'cdnjs', 'skypack']
  }).then(() => {
    console.log('Lodash loaded:', typeof _);
  }).catch(err => {
    console.error('All CDNs failed:', err);
  });
</script>
