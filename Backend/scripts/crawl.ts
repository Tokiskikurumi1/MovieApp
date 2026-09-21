import { crawlKKPhim } from '../src/crawler/kkphim';

// Phân tích tham số dòng lệnh
// Ví dụ: npx tsx scripts/crawl.ts --from=1 --to=2 --delay=300
// hoặc: npx tsx scripts/crawl.ts --slug=muc-than-ky
const args = process.argv.slice(2);
let fromPage = 1;
let toPage = 1;
let singleSlug: string | undefined;
let delayMs = 300;

for (const arg of args) {
  if (arg.startsWith('--from=')) {
    fromPage = parseInt(arg.replace('--from=', ''), 10) || 1;
  } else if (arg.startsWith('--to=')) {
    toPage = parseInt(arg.replace('--to=', ''), 10) || 1;
  } else if (arg.startsWith('--page=')) {
    const p = parseInt(arg.replace('--page=', ''), 10) || 1;
    fromPage = p;
    toPage = p;
  } else if (arg.startsWith('--slug=')) {
    singleSlug = arg.replace('--slug=', '').trim();
  } else if (arg.startsWith('--delay=')) {
    delayMs = parseInt(arg.replace('--delay=', ''), 10) || 300;
  }
}

async function run() {
  try {
    await crawlKKPhim({
      fromPage,
      toPage,
      singleSlug,
      delayMs,
    });
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi chạy crawler:', err);
    process.exit(1);
  }
}

run();
