/* Service worker do app Contato (PWA) — Web Push.
   Mostra a notificação quando chega um push (app fechado / em segundo plano) e
   abre/foca o app ao tocar nela. O som é o padrão de notificação do sistema. */

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Contato', body: event.data ? event.data.text() : '' };
  }
  var title = data.title || 'Contato';
  var options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Tag agrupa por chamado/decisão (a nova substitui a anterior). renotify:true
    // faz o Android RE-ALERTAR (som/vibração) mesmo ao substituir — sem isso, a
    // 2ª notificação do mesmo chamado entra muda no Android.
    tag: data.tag || 'contato',
    renotify: true,
    // silent:false é explícito de propósito: garante que NÃO entre no modo
    // silencioso (alguns navegadores tratam silent ausente de forma ambígua).
    silent: false,
    vibrate: [200, 100, 200, 100, 200],
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientsArr) {
      for (var i = 0; i < clientsArr.length; i++) {
        var client = clientsArr[i];
        if ('focus' in client) {
          if (client.navigate) client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
