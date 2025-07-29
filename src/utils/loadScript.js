export const loadScript = (url) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) return resolve(); // already loaded

    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
