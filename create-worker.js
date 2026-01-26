const fs = require("fs");
const path = require("path");

// Создаем простой Worker для статики
const workerContent = `
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // Статические файлы из .next/static
  if (pathname.startsWith('/_next/static/')) {
    return fetch(event.request);
  }
  
  // Для API маршрутов (если есть)
  if (pathname.startsWith('/api/')) {
    // Здесь можно добавить логику для API
    return new Response('API Route', { status: 200 });
  }
  
  // Для динамических маршрутов
  if (pathname.startsWith('/page/Course/') || pathname.startsWith('/page/Video/')) {
    // SSR или статическая загрузка
    return fetch(event.request);
  }
  
  // Для всех остальных - отдаем статику
  return fetch(event.request);
}
`;

// Создаем папку public если нет
if (!fs.existsSync("public")) {
  fs.mkdirSync("public", { recursive: true });
}

// Записываем Worker
fs.writeFileSync("public/_worker.js", workerContent);

console.log("Worker created successfully!");
