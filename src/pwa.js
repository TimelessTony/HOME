export function registerPWA() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return
  if (window.location.hostname === 'localhost' || window.location.protocol === 'http:') {
    // Service workers over http only work on localhost; register anyway there.
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return
  }
  window.addEventListener('load', () => {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {
      // Silent: SW is an enhancement.
    })
  })
}
