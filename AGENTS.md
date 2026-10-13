# AGENTS.md

Website for https://airobotiks.de, served by GitHub Pages from main (root). Static HTML/CSS/JS only, no build step. Keep CNAME unchanged. Build brief:

Build the complete website for airobotiks.de ("AI Robotiks") from scratch in this repository. Work fully autonomously; do not ask questions, make reasonable choices and note them in the PR.

## Concept
An explainer site on how AI is changing robotics: sections on perception, manipulation, humanoids, cobots in industry and robots in care, plus a small interactive canvas demo where a simulated robot arm reaches toward the mouse pointer (inverse kinematics).

## Look and feel
Tech-lab feel: dark graphite background, cyan and lime accents, grid lines, a futuristic display font for headings.

## Hard requirements
- Static site only: plain HTML, CSS and vanilla JavaScript in the repository root (index.html at the root). No build step, no frameworks, no npm, no external CDNs, no web fonts from third parties (use system font stacks or self-hosted font files you add), no analytics, cookies or trackers. GitHub Pages serves the main branch root as-is.
- Keep the existing CNAME file exactly as it is (it contains "airobotiks.de").
- Language: German. Proper umlauts (UTF-8, <meta charset="utf-8">).
- At least: index.html (rich one-page landing with the interactive feature described above), impressum.html and datenschutz.html (privacy page stating that no data is collected, no cookies are set, and that the site is hosted on GitHub Pages). For the Impressum use clearly marked placeholders like [Name], [Adresse], [E-Mail]; never invent a real-looking person, company, address, phone number, testimonial, price or statistic. Use a custom 404.html in the same style.
- Responsive from 360px phones to wide desktops; no horizontal scroll. Accessible: semantic landmarks, alt text, visible focus, contrast WCAG AA, respects prefers-reduced-motion and supports prefers-color-scheme dark.
- SEO basics: unique <title> and meta description, Open Graph tags, a favicon (inline SVG file), robots.txt and sitemap.xml using https://airobotiks.de/.
- All interactive features must work offline in the browser with no server calls. No console errors.
- Quality bar: this must look like a polished, distinctive, professional site, not a template. Real, accurate, useful content (at least ~800 words across the page), not lorem ipsum.
- Update README.md with a short description of the site and file structure. Do not touch AGENTS.md.
- Finish by opening a pull request against main with a summary of what you built.
