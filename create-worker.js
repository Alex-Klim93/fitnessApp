const fs = require("fs-extra");
const path = require("path");

async function createWorker() {
  console.log("Creating Cloudflare Worker...");
  
  const workerContent = `
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // 1. Для статических файлов (.next/static, etc.)
  if (pathname.startsWith('/_next/') || 
      pathname.includes('.') && !pathname.endsWith('/')) {
    return fetch(event.request);
  }
  
  // 2. Для статических страниц (рендерятся Next.js)
  // Cloudflare Pages сам обработает SSR через Next.js
  return fetch(event.request);
}
`;

  // Создаем Worker прямо в .next/
  const nextDir = path.join(__dirname, ".next");
  await fs.ensureDir(nextDir);
  await fs.writeFile(path.join(nextDir, "_worker.js"), workerContent);
  
  console.log("Worker created in .next/_worker.js");
}

createWorker().catch(console.error);