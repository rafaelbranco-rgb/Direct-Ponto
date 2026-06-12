// HTML raiz da versão WEB (Expo Router). Adiciona o manifest e os ícones para
// "Adicionar à tela inicial" (PWA) ter a logo do Contato, no Android e no iOS.
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA — instalável com a logo do Contato */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#15294E" />
        <link rel="icon" type="image/png" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Contato" />

        {/* Evita o "flash" branco de fundo e mantém o scroll dentro das listas. */}
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `html,body{background-color:#0B1220;}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
