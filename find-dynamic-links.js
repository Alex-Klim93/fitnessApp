const fs = require('fs');
const path = require('path');

function searchInFiles(dir, pattern) {
  const results = [];

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !filePath.includes('node_modules')) {
        walk(filePath);
      } else if (
        stat.isFile() &&
        (file.endsWith('.tsx') ||
          file.endsWith('.ts') ||
          file.endsWith('.jsx') ||
          file.endsWith('.js'))
      ) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes(pattern)) {
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.includes(pattern)) {
                results.push({
                  file: filePath,
                  line: index + 1,
                  content: line.trim(),
                });
              }
            });
          }
        } catch (err) {
          console.error(`Error reading ${filePath}:`, err);
        }
      }
    }
  }

  walk(dir);
  return results;
}

// Ищем разные паттерны
const patterns = [
  '/page/[',
  '/page/${',
  'href="/page/',
  "href='/page/",
  'href={`/page/',
];

console.log('🔍 Поиск динамических ссылок в проекте...\n');

patterns.forEach((pattern) => {
  console.log(`\nПоиск паттерна: "${pattern}"`);
  const results = searchInFiles(process.cwd(), pattern);

  if (results.length > 0) {
    results.forEach((result) => {
      console.log(`📄 ${result.file}:${result.line}`);
      console.log(`   ${result.content}`);
    });
  } else {
    console.log('   Не найдено');
  }
});
