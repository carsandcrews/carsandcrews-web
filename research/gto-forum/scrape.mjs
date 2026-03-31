import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const THREADS = JSON.parse(fs.readFileSync('/tmp/gto-threads.json', 'utf-8'));
const OUT_DIR = '/home/openclaw/Projects/carsandcrews-web/research/gto-forum';
const IMG_DIR = path.join(OUT_DIR, 'images');
const KEVIN_USERNAME = 'kevnord';

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[''""]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : `https://www.gtoforum.com${res.headers.location}`;
        return downloadFile(loc, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const ws = fs.createWriteStream(destPath);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(destPath); });
      ws.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function expandAllReplies(page) {
  let totalClicks = 0;
  for (let round = 0; round < 50; round++) {
    const btns = await page.$$('span.toggle-replies-button');
    let clicked = false;
    for (const btn of btns) {
      try {
        const visible = await btn.isVisible();
        if (visible) {
          await btn.click();
          await sleep(400);
          clicked = true;
          totalClicks++;
        }
      } catch (e) { /* button may have been removed */ }
    }
    if (!clicked) break;
  }
  return totalClicks;
}

function extractPostContent(bodyEl) {
  if (!bodyEl) return { text: '', imageSrcs: [] };

  const clone = bodyEl.cloneNode(true);
  const imageSrcs = [];

  // Collect images
  const imgs = clone.querySelectorAll('img');
  imgs.forEach(img => {
    const src = img.src || img.getAttribute('data-src') || '';
    if (src && !src.includes('smilies') && !src.includes('emoji') && !src.includes('/styles/') && !src.includes('data:image')) {
      imageSrcs.push(src);
    }
  });

  // Also check for lightbox containers with data-src
  const lbContainers = clone.querySelectorAll('.lbContainer-zoomer[data-src], [data-src]');
  lbContainers.forEach(el => {
    const src = el.getAttribute('data-src') || '';
    if (src && src.includes('attachment') && !imageSrcs.includes(src)) {
      imageSrcs.push(src);
    }
  });

  // Convert quotes to markdown-style
  const quotes = clone.querySelectorAll('.bbCodeBlock--quote');
  quotes.forEach(q => {
    const attribution = q.querySelector('.bbCodeBlock-title');
    const quoteContent = q.querySelector('.bbCodeBlock-expandContent, .bbCodeBlock-content');
    const attr = attribution ? attribution.textContent.trim() : '';
    const qText = quoteContent ? quoteContent.textContent.trim() : '';
    const replacement = document.createElement('span');
    replacement.textContent = `\n> ${attr}\n> ${qText}\n`;
    q.replaceWith(replacement);
  });

  const text = clone.textContent.trim()
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\t+/g, ' ');

  return { text, imageSrcs };
}

async function scrapeThread(page, threadInfo, index) {
  const { title, url } = threadInfo;
  const slug = slugify(title);
  console.log(`[${index + 1}/${THREADS.length}] Scraping: ${title}`);

  // Strip the /post-XXXXX anchor to get the thread base URL
  const threadUrl = url.replace(/\/post-\d+$/, '/');

  try {
    await page.goto(threadUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);

    // Expand all nested "show more replies"
    const expandClicks = await expandAllReplies(page);
    if (expandClicks > 0) {
      console.log(`  Expanded ${expandClicks} nested reply sections`);
      await sleep(1000);
    }

    // Extract the OP (original post) which is in a special section
    const opData = await page.evaluate(() => {
      // OP is in the california-thread-body-container > div.hidden > article.message-body > div.bbWrapper
      // OR it might be the first .bbWrapper not inside an article[data-content]
      const allBbWrappers = document.querySelectorAll('.bbWrapper');
      let opWrapper = null;
      for (const bb of allBbWrappers) {
        const inReply = bb.closest('article[data-content], article.js-post');
        if (!inReply) {
          opWrapper = bb;
          break;
        }
      }

      if (!opWrapper) return null;

      // OP author - find the "Discussion starter" text
      const starterEl = [...document.querySelectorAll('a')].find(a => {
        const parent = a.parentElement;
        return parent && parent.textContent.includes('Discussion starter');
      });
      const author = starterEl ? starterEl.textContent.trim() : '';

      // OP date
      const timeEl = document.querySelector('time[datetime]');
      const date = timeEl ? timeEl.getAttribute('datetime') : '';

      // OP content
      const clone = opWrapper.cloneNode(true);
      const imageSrcs = [];

      // Images from lightbox containers
      const opSection = opWrapper.closest('article, div');
      const lbElements = opSection ? opSection.querySelectorAll('.lbContainer-zoomer[data-src], [data-src]') : [];
      lbElements.forEach(el => {
        const src = el.getAttribute('data-src') || '';
        if (src && src.includes('attachment')) imageSrcs.push(src);
      });

      // Images from img tags
      clone.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('data-src') || '';
        if (src && !src.includes('smilies') && !src.includes('emoji') && !src.includes('/styles/') && !src.includes('data:image')) {
          if (!imageSrcs.includes(src)) imageSrcs.push(src);
        }
      });

      // Quotes
      clone.querySelectorAll('.bbCodeBlock--quote').forEach(q => {
        const attr = q.querySelector('.bbCodeBlock-title');
        const content = q.querySelector('.bbCodeBlock-expandContent, .bbCodeBlock-content');
        const attrText = attr ? attr.textContent.trim() : '';
        const contentText = content ? content.textContent.trim() : '';
        const span = document.createElement('span');
        span.textContent = `\n> ${attrText}\n> ${contentText}\n`;
        q.replaceWith(span);
      });

      const text = clone.textContent.trim().replace(/\n{3,}/g, '\n\n').replace(/\t+/g, ' ');

      return { author, date, text, imageSrcs };
    });

    // Extract all reply posts
    const replyPosts = await page.evaluate(() => {
      const posts = [];
      const articles = document.querySelectorAll('article[data-content]');
      articles.forEach(article => {
        const author = article.getAttribute('data-author') || 'Unknown';
        const dateEl = article.querySelector('meta[itemprop="datePublished"]') || article.querySelector('time[datetime]');
        const date = dateEl ? (dateEl.getAttribute('content') || dateEl.getAttribute('datetime') || '') : '';
        const bodyEl = article.querySelector('.message-body .bbWrapper') || article.querySelector('.bbWrapper');

        let text = '';
        const imageSrcs = [];

        if (bodyEl) {
          const clone = bodyEl.cloneNode(true);

          // Lightbox images
          const lbElements = article.querySelectorAll('.lbContainer-zoomer[data-src], [data-src]');
          lbElements.forEach(el => {
            const src = el.getAttribute('data-src') || '';
            if (src && src.includes('attachment')) imageSrcs.push(src);
          });

          // Regular images
          clone.querySelectorAll('img').forEach(img => {
            const src = img.src || img.getAttribute('data-src') || '';
            if (src && !src.includes('smilies') && !src.includes('emoji') && !src.includes('/styles/') && !src.includes('data:image')) {
              if (!imageSrcs.includes(src)) imageSrcs.push(src);
            }
          });

          // Quotes
          clone.querySelectorAll('.bbCodeBlock--quote').forEach(q => {
            const attr = q.querySelector('.bbCodeBlock-title');
            const content = q.querySelector('.bbCodeBlock-expandContent, .bbCodeBlock-content');
            const attrText = attr ? attr.textContent.trim() : '';
            const contentText = content ? content.textContent.trim() : '';
            const span = document.createElement('span');
            span.textContent = `\n> ${attrText}\n> ${contentText}\n`;
            q.replaceWith(span);
          });

          text = clone.textContent.trim().replace(/\n{3,}/g, '\n\n').replace(/\t+/g, ' ');
        }

        posts.push({ author, date, text, imageSrcs });
      });
      return posts;
    });

    // Combine OP + replies
    const allPosts = [];
    if (opData) {
      allPosts.push({
        author: opData.author || 'Unknown',
        date: opData.date,
        text: opData.text,
        imageSrcs: opData.imageSrcs,
        isOP: true
      });
    }
    for (const rp of replyPosts) {
      allPosts.push({ ...rp, isOP: false });
    }

    const totalReplies = replyPosts.length;
    console.log(`  Found OP + ${totalReplies} replies (${allPosts.length} total posts)`);

    // Download images
    let imgCounter = 0;
    for (const post of allPosts) {
      post.downloadedImages = [];
      for (const src of (post.imageSrcs || [])) {
        imgCounter++;
        const urlObj = new URL(src, 'https://www.gtoforum.com');
        let ext = path.extname(urlObj.pathname).split('?')[0];
        if (!ext || ext.length > 5) ext = '.jpg';
        const filename = `${slug}-${imgCounter}${ext}`;
        const destPath = path.join(IMG_DIR, filename);
        try {
          const fullUrl = src.startsWith('http') ? src : `https://www.gtoforum.com${src}`;
          await downloadFile(fullUrl, destPath);
          post.downloadedImages.push({ src, filename });
          console.log(`    Image: ${filename}`);
        } catch (e) {
          console.log(`    Failed image: ${src} — ${e.message}`);
        }
      }
    }

    // Format date
    let displayDate = opData?.date || '';
    if (displayDate.includes('T')) {
      try {
        displayDate = new Date(displayDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) { }
    }

    // Build markdown
    const kevinPosts = allPosts.filter(p => p.author.toLowerCase() === KEVIN_USERNAME);
    const isKevinOP = allPosts[0]?.author.toLowerCase() === KEVIN_USERNAME;

    // Helpers
    const helpers = {};
    for (const post of allPosts) {
      if (post.author.toLowerCase() === KEVIN_USERNAME) continue;
      if (!helpers[post.author]) helpers[post.author] = { count: 0, firstSnippet: '' };
      helpers[post.author].count++;
      if (!helpers[post.author].firstSnippet) {
        helpers[post.author].firstSnippet = post.text.slice(0, 200).replace(/\n/g, ' ');
      }
    }

    let md = `# ${title}\n`;
    md += `**Forum:** GTO Forum | **Started:** ${displayDate} | **Replies:** ${totalReplies}\n`;
    md += `**Thread URL:** ${url}\n\n`;

    // The Issue
    if (isKevinOP && allPosts[0]?.text) {
      md += `## The Issue\n`;
      const issueText = allPosts[0].text.slice(0, 500).replace(/\n/g, ' ').trim();
      md += `${issueText}${allPosts[0].text.length > 500 ? '...' : ''}\n\n`;
    }

    // Solution / Outcome
    if (kevinPosts.length > 1) {
      const lastKevin = kevinPosts[kevinPosts.length - 1];
      md += `## Solution / Outcome\n`;
      const solutionText = lastKevin.text.slice(0, 500).replace(/\n/g, ' ').trim();
      md += `${solutionText}${lastKevin.text.length > 500 ? '...' : ''}\n\n`;
    }

    // Key Advice
    const helperEntries = Object.entries(helpers);
    if (helperEntries.length > 0) {
      md += `## Key Advice\n`;
      for (const [user, info] of helperEntries) {
        md += `- **@${user}**: ${info.firstSnippet.slice(0, 200)}\n`;
      }
      md += `\n`;

      md += `## Helpers\n`;
      for (const [user, info] of helperEntries) {
        md += `- **@${user}** — ${info.count} post(s)\n`;
      }
      md += `\n`;
    }

    // Full Thread
    md += `## Thread Summary\n\n`;

    for (let i = 0; i < allPosts.length; i++) {
      const post = allPosts[i];
      const isKevin = post.author.toLowerCase() === KEVIN_USERNAME;
      const label = post.isOP
        ? (isKevin ? "Kevin's Original Post" : `Original Post by @${post.author}`)
        : `Reply #${i}`;

      if (post.isOP && isKevin) {
        md += `### Kevin's Original Post\n`;
      } else if (post.isOP) {
        md += `### Original Post\n`;
        md += `**@${post.author}**:\n`;
      } else {
        if (i === 1 && allPosts[0]?.isOP) {
          md += `### Replies\n\n`;
        }
        md += `**@${post.author}** (reply #${i}):\n`;
      }

      md += `${post.text}\n\n`;

      if (post.downloadedImages?.length > 0) {
        for (const img of post.downloadedImages) {
          md += `![${title}](./images/${img.filename})\n`;
        }
        md += `\n`;
      }
    }

    // Images section
    const allDownloaded = allPosts.flatMap(p => p.downloadedImages || []);
    if (allDownloaded.length > 0) {
      md += `## Images\n`;
      for (const img of allDownloaded) {
        md += `![${title}](./images/${img.filename})\n`;
      }
      md += `\n`;
    }

    const filename = `${slug}.md`;
    fs.writeFileSync(path.join(OUT_DIR, filename), md);
    console.log(`  Done: ${filename} (${allPosts.length} posts, ${allDownloaded.length} images)`);

    return { title, slug, filename, postCount: allPosts.length, imageCount: allDownloaded.length, success: true };

  } catch (e) {
    console.error(`  ERROR: "${title}" — ${e.message}`);
    return { title, slug, filename: null, postCount: 0, imageCount: 0, success: false, error: e.message };
  }
}

// Category classification
function categorize(title) {
  const t = title.toLowerCase();
  if (/exhaust|pypes|hanger|downpipe|flange/.test(t)) return 'Exhaust';
  if (/brake|disc|pedal/.test(t)) return 'Brakes';
  if (/suspension|spring|shock|coil|ride height|ball joint|grease/.test(t)) return 'Suspension';
  if (/tire|wheel|spare/.test(t)) return 'Wheels / Tires';
  if (/jet|carb|rochester|fuel|pump|pcv|throttle|timing|engine|ping|stumbl|water pump|phenolic|air cleaner|breather|vent|crankshaft|pulley|vacuum|acceleration/.test(t)) return 'Engine';
  if (/fuel sender|connector|firewall|plug|electrical|hei/.test(t)) return 'Electrical';
  if (/window|crank|latch|door|handle|interior/.test(t)) return 'Interior';
  if (/transmission|filter|st-300/.test(t)) return 'Drivetrain';
  if (/tail light|lens/.test(t)) return 'Exterior';
  if (/induction heater|bolt removal|cutting tool|clearance/.test(t)) return 'Tools / Techniques';
  return 'General';
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  const results = [];
  const errors = [];

  for (let i = 0; i < THREADS.length; i++) {
    const result = await scrapeThread(page, THREADS[i], i);
    results.push(result);
    if (!result.success) errors.push(result);

    // Respectful delay between threads
    if (i < THREADS.length - 1) {
      await sleep(2000);
    }
  }

  await browser.close();

  // Build index.md
  const categories = {};
  for (const r of results) {
    if (!r.success) continue;
    const cat = categorize(r.title);
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(r);
  }

  const catOrder = ['Engine', 'Exhaust', 'Brakes', 'Suspension', 'Wheels / Tires', 'Drivetrain', 'Electrical', 'Interior', 'Exterior', 'Tools / Techniques', 'General'];

  let indexMd = `# GTO Forum Research — kevnord's Threads\n\n`;
  indexMd += `Scraped ${results.filter(r => r.success).length} of ${THREADS.length} threads from gtoforum.com\n\n`;

  if (errors.length > 0) {
    indexMd += `## Errors (${errors.length})\n`;
    for (const e of errors) {
      indexMd += `- ${e.title}: ${e.error}\n`;
    }
    indexMd += `\n`;
  }

  for (const cat of catOrder) {
    if (!categories[cat] || categories[cat].length === 0) continue;
    indexMd += `## ${cat}\n\n`;
    for (const r of categories[cat]) {
      indexMd += `- [${r.title}](./${r.filename}) — ${r.postCount} posts, ${r.imageCount} images\n`;
    }
    indexMd += `\n`;
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.md'), indexMd);
  console.log(`\n=== COMPLETE ===`);
  console.log(`${results.filter(r => r.success).length}/${THREADS.length} threads scraped`);
  console.log(`Total posts: ${results.reduce((s, r) => s + r.postCount, 0)}`);
  console.log(`Total images: ${results.reduce((s, r) => s + r.imageCount, 0)}`);
  if (errors.length > 0) {
    console.log(`${errors.length} errors:`);
    errors.forEach(e => console.log(`  - ${e.title}: ${e.error}`));
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
