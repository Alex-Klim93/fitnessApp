const fs = require("fs-extra");
const path = require("path");

async function createWorker() {
  console.log("Starting worker creation...");

  // 1. Создаем папку public если нет
  const publicDir = path.join(__dirname, "public");
  await fs.ensureDir(publicDir);

  // 2. Копируем ВСЕ нужные файлы из .next в public
  const nextDir = path.join(__dirname, ".next");

  if (await fs.pathExists(nextDir)) {
    // Копируем статические файлы
    const staticDir = path.join(nextDir, "static");
    if (await fs.pathExists(staticDir)) {
      await fs.copy(staticDir, path.join(publicDir, "_next", "static"));
      console.log("Copied .next/static to public/_next/static");
    }

    // Копируем HTML файлы (для статических страниц)
    const buildDir = path.join(nextDir, "build");
    if (await fs.pathExists(buildDir)) {
      // Ищем HTML файлы
      const files = await fs.readdir(buildDir);
      for (const file of files) {
        if (file.endsWith(".html")) {
          await fs.copy(path.join(buildDir, file), path.join(publicDir, file));
        }
      }
      console.log("Copied HTML files");
    }

    // Копируем из .next/server (если есть)
    const serverDir = path.join(nextDir, "server");
    if (await fs.pathExists(serverDir)) {
      // Копируем app directory pages
      const appDir = path.join(serverDir, "app");
      if (await fs.pathExists(appDir)) {
        const appPages = await fs.readdir(appDir);
        for (const page of appPages) {
          if (page.endsWith(".html")) {
            await fs.copy(path.join(appDir, page), path.join(publicDir, page));
          }
        }
        console.log("Copied app pages");
      }
    }
  }

  // 3. Создаем Worker файл
  const workerContent = `
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
    const possibleFile = \`\${pathname}.html\`;
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
      \`<html>
        <head><title>Динамический контент</title></head>
        <body>
          <h1>Динамический маршрут: \${pathname}</h1>
          <p>Этот маршрут требует Server-Side Rendering (SSR).</p>
          <p>Рекомендации:</p>
          <ul>
            <li>Используйте Cloudflare Pages с Next.js preset</li>
            <li>Или сделайте эти маршруты статическими</li>
            <li>Или используйте статическую генерацию с getStaticPaths</li>
          </ul>
          <p><a href="/">Вернуться на главную</a></p>
        </body>
      </html>\`,
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
`;

  await fs.writeFile(path.join(publicDir, "_worker.js"), workerContent);
  console.log("Worker created successfully in public/_worker.js");

  // 4. Создаем index.html если нет (fallback)
  const indexPath = path.join(publicDir, "index.html");
  if (!(await fs.pathExists(indexPath))) {
    const indexHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Fitness App</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    .loading {
      text-align: center;
      padding: 50px;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div id="root">
    <div class="loading">
      <h1>Fitness App</h1>
      <p>Загрузка приложения...</p>
      <p>Если приложение не загружается, проверьте:</p>
      <ul>
        <li>JavaScript включен</li>
        <li>Сборка прошла успешно</li>
        <li>Статические файлы доступны</li>
      </ul>
      <p><a href="/page/Profile">Профиль</a></p>
    </div>
  </div>
  <script>
    // SPA навигация
    document.addEventListener('DOMContentLoaded', function() {
      const path = window.location.pathname;
      const root = document.getElementById('root');
      
      if (path === '/') {
        root.innerHTML = '<h1>Главная страница</h1><p>Добро пожаловать в Fitness App!</p>';
      } else if (path === '/page/Profile') {
        root.innerHTML = '<h1>Профиль</h1><p>Страница профиля пользователя</p>';
      } else if (path.startsWith('/page/Course/')) {
        const courseId = path.split('/').pop();
        root.innerHTML = '<h1>Курс ' + courseId + '</h1><p>Информация о курсе</p>';
      } else if (path.startsWith('/page/Video/')) {
        const videoId = path.split('/').pop();
        root.innerHTML = '<h1>Видео ' + videoId + '</h1><p>Просмотр видео</p>';
      }
    });
  </script>
</body>
</html>
`;
    await fs.writeFile(indexPath, indexHtml);
    console.log("Created fallback index.html");
  }

  console.log("Build completed successfully!");
}

createWorker().catch(console.error);
