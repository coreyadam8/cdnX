// cdnX - a dynamic multi-CDN JS loader library
// Author: Corey Adam
// License: MIT

(() => {
  if (window.cdnX) return; // Avoid overwrite

  // Internal state
  const cdnProviders = new Map();
  const cache = new Map();

  // Default resolver templates for popular CDNs (can be overridden)
  const defaultResolvers = {
    jsdelivr: ({ pkg, version, path }) =>
      `https://cdn.jsdelivr.net/npm/${pkg}@${version}/${path}`,
    unpkg: ({ pkg, version, path }) =>
      `https://unpkg.com/${pkg}@${version}/${path}`,
    cdnjs: ({ pkg, version, path }) =>
      `https://cdnjs.cloudflare.com/ajax/libs/${pkg}/${version}/${path}`,
    skypack: ({ pkg, version, path }) =>
      `https://cdn.skypack.dev/${pkg}@${version}${path ? `/${path}` : ''}`,
  };

  // Register a CDN provider
  // name: string (unique id)
  // resolver: function({pkg, version, path}) => url string
  function registerCDN(name, resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError('resolver must be a function');
    }
    cdnProviders.set(name, resolver);
  }

  // Remove a CDN provider by name
  function unregisterCDN(name) {
    cdnProviders.delete(name);
  }

  // List all registered CDNs
  function listCDNs() {
    return Array.from(cdnProviders.keys());
  }

  // Helper to load a JS script dynamically by URL
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      if (cache.has(url)) {
        resolve(cache.get(url));
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;

      script.onload = () => {
        cache.set(url, url);
        resolve(url);
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script at ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  // Main API: load a library by name, version, file path, and CDN order
  // options:
  //   cdnOrder: array of CDN provider names to try, defaults to all registered in insertion order
  //   timeout: optional ms to timeout each CDN load (default 10s)
  async function loadLibrary(pkg, version = 'latest', path = 'index.js', options = {}) {
    if (typeof pkg !== 'string' || !pkg) {
      throw new TypeError('Package name must be a non-empty string');
    }

    const cdnsToTry = Array.isArray(options.cdnOrder) && options.cdnOrder.length > 0
      ? options.cdnOrder
      : Array.from(cdnProviders.keys());

    if (cdnsToTry.length === 0) {
      throw new Error('No CDN providers registered');
    }

    const timeout = typeof options.timeout === 'number' ? options.timeout : 10000;

    // Try each CDN in order until one loads successfully
    for (const cdnName of cdnsToTry) {
      const resolver = cdnProviders.get(cdnName);
      if (!resolver) continue;

      let url;
      try {
        url = resolver({ pkg, version, path });
        if (typeof url !== 'string' || !url) throw new Error('Resolver returned invalid URL');
      } catch (err) {
        console.warn(`cdnX resolver error for ${cdnName}:`, err);
        continue;
      }

      try {
        // Timeout wrapper for loadScript
        await Promise.race([
          loadScript(url),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Load timeout')), timeout))
        ]);
        return url; // success, return loaded URL
      } catch (err) {
        // Log error but try next CDN
        console.warn(`cdnX failed to load from ${cdnName}: ${url}`, err);
      }
    }

    throw new Error(`cdnX failed to load library '${pkg}'@'${version}' from all CDNs`);
  }

  // Register default CDNs on init
  Object.entries(defaultResolvers).forEach(([name, resolver]) => {
    cdnProviders.set(name, resolver);
  });

  // Expose API
  window.cdnX = {
    registerCDN,
    unregisterCDN,
    listCDNs,
    loadLibrary,
  };
})();


// Example on how to use
//
/*<script src="cdnX.js"></script>
<script>
  (async () => {
    try {
      // Load lodash from cdnjs, fallback to jsdelivr if needed
      await cdnX.loadLibrary('lodash', '4.17.21', 'lodash.min.js', {
        cdnOrder: ['cdnjs', 'jsdelivr'],
        timeout: 8000,
      });
      console.log('Lodash loaded:', _);
      console.log('_.chunk([1,2,3,4], 2):', _.chunk([1,2,3,4], 2));
    } catch (err) {
      console.error('Failed to load lodash:', err);
    }
  })();
</script>*/
//
//