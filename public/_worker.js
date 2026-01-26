
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

const STATIC_FILES = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'json', 'txt', 'xml', 'webp', 'woff', 'woff2', 'ttf', 'eot'];

async function handleRequest(event) {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  const extension = pathname.split('.').pop().toLowerCase();
  
  // 1. Для статических файлов - отдаем как есть
  if (STATIC_FILES.includes(extension) || pathname.includes('/_next/')) {
    return fetch(event.request);
  }
  
  // 2. Для известных статических страниц
  const staticPages = {
    '/': '/index.html',
    '/page/Profile': '/page/Profile.html',
    '/_not-found': '/_not-found.html'
  };
  
  if (staticPages[pathname]) {
    const pageUrl = new URL(staticPages[pathname], event.request.url);
    return fetch(new Request(pageUrl, event.request));
  }
  
  // 3. Для динамических маршрутов
  if (pathname.startsWith('/page/Course/') || pathname.startsWith('/page/Video/')) {
    // Если есть файл - отдаем его
    const possibleFile = `${pathname}.html`;
    try {
      const fileRequest = new Request(new URL(possibleFile, event.request.url), event.request);
      const response = await fetch(fileRequest);
      if (response.status !== 404) {
        return response;
      }
    } catch (e) {
      // Файла нет - показываем сообщение
    }
    
    return new Response(
      `<html>
        <head><title>Динамический контент</title></head>
        <body>
          <h1>Динамический маршрут: ${pathname}</h1>
          <p>Этот маршрут требует Server-Side Rendering (SSR).</p>
          <p>Рекомендации:</p>
          <ul>
            <li>Используйте Cloudflare Pages с Next.js preset</li>
            <li>Или сделайте эти маршруты статическими</li>
            <li>Или используйте статическую генерацию с getStaticPaths</li>
          </ul>
          <p><a href="/">Вернуться на главную</a></p>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
  
  // 4. Для всех остальных - пробуем index.html (SPA fallback)
  try {
    return fetch(new URL('/index.html', event.request.url));
  } catch (e) {
    return new Response('Not Found', { status: 404 });
  }
}
