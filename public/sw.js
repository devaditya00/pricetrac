self.addEventListener('install', function(event) {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim())
})

self.addEventListener('push', function(event) {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch(e) {
    data = { title: 'PriceTrac', body: event.data ? event.data.text() : 'Price alert!' }
  }

  const title = data.title || 'PriceTrac Alert'
  const options = {
    body: data.body || 'Price drop detected!',
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url: data.url || '/dashboard' },
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})