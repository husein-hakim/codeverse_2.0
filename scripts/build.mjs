import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of ['index.html', 'assets', 'css', 'js']) await cp(resolve(root, name), resolve(output, name), { recursive: true });
await mkdir(resolve(output, 'js/vendor'), { recursive: true });
for (const [source, target] of [
 ['three/build/three.module.js', 'three.module.js'],
 ['three/build/three.core.js', 'three.core.js'],
 ['gsap/dist/gsap.min.js', 'gsap.min.js'],
 ['gsap/dist/ScrollTrigger.min.js', 'ScrollTrigger.min.js'],
 ['three/LICENSE', 'three-LICENSE.txt']
]) await cp(resolve(root, 'node_modules', source), resolve(output, 'js/vendor', target));
const gsapPackage = JSON.parse(await readFile(resolve(root, 'node_modules/gsap/package.json'), 'utf8'));
await writeFile(resolve(output, 'js/vendor/gsap-LICENSE.txt'), `GSAP ${gsapPackage.version}\nLicense: ${gsapPackage.license}\nhttps://gsap.com/standard-license/\n`);
const rawOrigin = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
if (rawOrigin) {
 const url = new URL(rawOrigin);
 if (!['https:', 'http:'].includes(url.protocol)) throw new Error('SITE_URL must be an HTTP(S) URL');
 const origin = url.origin;
 const meta = `<meta property="og:url" content="${origin}/"><link rel="canonical" href="${origin}/">`;
 const path = resolve(output, 'index.html');
 let html = await readFile(path, 'utf8');
 html = html.replace('<!-- DEPLOYMENT_METADATA -->', meta).replace('content="assets/social-preview.jpg"', `content="${origin}/assets/social-preview.jpg"`);
 await writeFile(path, html);
 await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
 await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`);
}
console.log('Built independent static website: dist/');
