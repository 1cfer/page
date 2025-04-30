export default function mpld3LoadLib(url, callback) {
  const s = document.createElement('script');
  s.src = url;
  s.async = true;
  s.onreadystatechange = s.onload = callback;
  s.onerror = function () {
    console.warn(`failed to load library ${url}`);
  };
  document.getElementsByTagName('head')[0].appendChild(s);
}
