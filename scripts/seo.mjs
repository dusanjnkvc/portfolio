import { readFile, writeFile, access, unlink } from 'node:fs/promises';
import path from 'node:path';

// Match Vite's production env-file order; shell/CI variables take precedence.
const fileEnv = {};
for (const filename of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  try {
    const source = await readFile(filename, 'utf8');
    for (const line of source.split(/\r?\n/)) {
      const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match) continue;
      let value = match[2];
      if (/^(["']).*\1$/.test(value)) value = value.slice(1, -1);
      else value = value.replace(/\s+#.*$/, '').trim();
      fileEnv[match[1]] = value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const configuredUrl = process.env.SITE_URL ?? fileEnv.SITE_URL ?? '';
let siteUrl;
if (configuredUrl.trim()) {
  try {
    siteUrl = new URL(configuredUrl.trim());
  } catch {
    throw new Error('SITE_URL must be an absolute production URL, including the repository path.');
  }
  const host = siteUrl.hostname.toLowerCase();
  if (!['https:', 'http:'].includes(siteUrl.protocol) || siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash ||
      ['localhost', '0.0.0.0', '[::1]', 'example.com', 'example.org', 'example.net'].includes(host) ||
      host.startsWith('127.') || host.endsWith('.localhost') || host.endsWith('.invalid')) {
    throw new Error('SITE_URL must identify the real production site, without credentials, query parameters or a fragment. Leave it empty for local builds.');
  }
  siteUrl.pathname = `${siteUrl.pathname.replace(/\/+$/, '')}/`;
}

const output = path.resolve('dist');
const htmlPath = path.join(output, 'index.html');
let html = await readFile(htmlPath, 'utf8');
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const exists = async filename => { try { await access(path.join(output, filename)); return true; } catch { return false; } };

// Remove only metadata owned by this build step, allowing repeat runs safely.
html = html
  .replace(/\s*<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '')
  .replace(/\s*<meta\b[^>]*property=["']og:url["'][^>]*>/gi, '')
  .replace(/\s*<meta\b[^>]*name=["']twitter:image["'][^>]*>/gi, '')
  .replace(/\s*<script\b[^>]*id=["']person-structured-data["'][^>]*>[\s\S]*?<\/script>/gi, '');

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Dušan Janković',
  jobTitle: ['Logistics Engineer', 'Technical Project Leader'],
  sameAs: ['https://www.linkedin.com/in/dusanjnkvc/'],
  knowsAbout: ['Internal logistics', 'Warehouse planning', 'Material-flow engineering', 'Technical project leadership', 'Logistics software'],
  knowsLanguage: ['English', 'German', 'Slovak', 'Serbian', 'Romanian'],
};
const tags = [];
if (siteUrl) {
  const canonical = siteUrl.href;
  const imageFilename = await exists('og-cover.png') ? 'og-cover.png' : 'og-cover.svg';
  if (!(await exists(imageFilename))) throw new Error('The configured social preview image is missing from dist.');
  const socialImage = new URL(imageFilename, siteUrl).href;
  html = html.replace(/(<meta\b[^>]*property=["']og:image["'][^>]*content=)["'][^"']*["']/i, `$1"${escapeHtml(socialImage)}"`);
  tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  tags.push(`<meta property="og:url" content="${escapeHtml(canonical)}" />`);
  tags.push(`<meta name="twitter:image" content="${escapeHtml(socialImage)}" />`);
  person.url = canonical;
  if (await exists('portrait.jpg')) person.image = new URL('portrait.jpg', siteUrl).href;
  await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${escapeHtml(canonical)}</loc></url>\n</urlset>\n`);
  await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`);
} else {
  // A local build must not advertise an invented deployment URL.
  await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  try { await unlink(path.join(output, 'sitemap.xml')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
tags.push(`<script id="person-structured-data" type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`);
html = html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
await writeFile(htmlPath, html);
console.log(siteUrl ? `SEO metadata generated for ${siteUrl.href}` : 'Local SEO metadata generated; canonical and sitemap omitted until SITE_URL is configured.');

