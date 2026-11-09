# Dušan Janković — Personal Portfolio

A responsive portfolio for internal logistics engineering, automotive projects, technical leadership and independent software development. Built with React, TypeScript, Vite, Lucide icons and lightweight SVG/CSS warehouse visuals. Fonts are bundled locally. There is no required backend, paid API or form subscription.

The site includes four complete language dictionaries (English, German, Slovak and Serbian), dark/light themes, expandable career entries, project detail dialogs and an interactive fictional warehouse with selectable racks, layer controls and an animated material route. Language and theme choices are remembered in the visitor’s browser.

## Run locally

Install a current Node.js 22 release, then run these commands from this project directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Stop the server with `Ctrl+C`.

```sh
npm run check
npm run build
npm run preview
```

`npm run build` first checks TypeScript, then creates the static site in `dist/` and generates production SEO metadata when `SITE_URL` is configured. `npm run preview` serves that build for review. Keep `package-lock.json` committed so local and GitHub builds install the same dependency versions.

## Host for free on GitHub Pages

The included `.github/workflows/deploy.yml` builds and deploys on a push to `main`, or when started manually from GitHub’s **Actions** tab. It uses the official GitHub Pages actions and needs no deployment token stored in the project.

1. Create a new public repository in your GitHub account, for example `dusanjnkvc/portfolio`.
2. Upload this project’s contents at the repository root, including `.github/`, `package-lock.json`, `src/`, `public/` and `scripts/`. Do not upload `node_modules/`, `dist/` or local `.env` files.
3. In the repository, open **Settings → Pages**. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Push the project to `main`, or select **Actions → Deploy portfolio to GitHub Pages → Run workflow** after enabling Pages.
5. Wait for the workflow to succeed. Use the deployed URL shown in the workflow or in **Settings → Pages**.

For a public `dusanjnkvc/portfolio` repository, the expected Pages address is `https://dusanjnkvc.github.io/portfolio/`. This is a deployment target, not proof that the site has been published. Use GitHub’s returned deployment URL to confirm the live address. Public repositories can use GitHub Pages on GitHub Free; consult the [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) for current account availability.

The workflow calculates the asset base from the actual repository name. A repository named `OWNER.github.io` uses `/`; project repositories use `/REPOSITORY/`. It takes the canonical site URL from GitHub’s Pages configuration. Rename the default branch in the workflow if your repository uses a branch other than `main`.

GitHub Pages setup must be enabled in the repository before this workflow can configure and deploy it. If that setting has not been changed automatically during delivery, complete step 3 above. Publication does not require a paid hosting plan or an external account beyond GitHub.

For a custom domain, configure it in **Settings → Pages** and update DNS according to GitHub’s documentation. If serving the site at the domain root, set the build’s `BASE_PATH` to `/` instead of the project-repository path.

## Configuration and contact

Start from `.env.example`. Values beginning with `VITE_` are embedded into the public JavaScript bundle. Use public values only.

| Setting | Purpose | Default |
| --- | --- | --- |
| `VITE_PUBLIC_EMAIL` | Opt in to a visible, functional `mailto:` contact link | Empty; LinkedIn contact remains available |
| `VITE_LOGEN_URL` | An approved public destination for the LogEN button | Empty; the button leads to contact |
| `SITE_URL` | Absolute production URL, including the repository path and trailing slash | Empty for local work |
| `BASE_PATH` | Asset path: `/` or `/repository-name/` | `/` |

For local contact configuration, copy `.env.example` to `.env.local`, fill only approved public values, and restart Vite. For GitHub Actions, add repository **Settings → Secrets and variables → Actions → Variables** named `PUBLIC_EMAIL` and/or `LOGEN_URL`. These are optional public configuration values, not secrets. Re-run deployment after changing them.

The CV email is deliberately not enabled automatically. A blank email setting keeps the contact section working through LinkedIn. There is no contact form that could report a false submission success.

For a manual build from PowerShell with a project URL:

```powershell
$env:BASE_PATH = '/portfolio/'
$env:SITE_URL = 'https://dusanjnkvc.github.io/portfolio/'
npm run build
```

For macOS/Linux shells:

```sh
BASE_PATH=/portfolio/ SITE_URL=https://dusanjnkvc.github.io/portfolio/ npm run build
```

The SEO step also reads `SITE_URL` from Vite-style production environment files. It rejects placeholder or local deployment URLs. With no production URL, it creates `robots.txt` without a sitemap reference and omits the canonical link and sitemap; no invented domain is advertised.

## Edit personal information and content

| File or directory | What to change |
| --- | --- |
| `src/config.ts` | Name, LinkedIn URL and asset filenames; public email and LogEN URL come from the optional environment variables |
| `src/data/content.ts` | Career history, project descriptions, competencies, education, headings, navigation labels and all four translations |
| `src/App.tsx` | Page composition and UI behavior |
| `src/components/Warehouse.tsx` | Fictional warehouse demonstration and SVG geometry |
| `src/components/Warehouse.css` | Warehouse-specific presentation |
| `src/styles.css` | Main layout, theme, typography and responsive styles |
| `public/` | Public portrait, downloadable CV, favicon and social preview artwork |
| `scripts/seo.mjs` | Build-time canonical URL, social metadata, sitemap, robots and Person structured data |

Keep facts consistent across all language dictionaries. The `Content` type checks dictionary structure. Do not add arbitrary skill percentages or unverified savings, budgets, team sizes, language levels or certificates.

The career dates come from the supplied CV. Its latest Segula role is listed as current, but the undated document does not independently establish current employment. Confirm the latest position before removing the source note or changing the date label.

The `Person` JSON-LD in `scripts/seo.mjs` contains public professional facts and a LinkedIn link. It omits contact details, home address, date of birth, personal phone number and a potentially unverified current employer. Update it if the public profile changes.

## Add a project

Add an item to `projects.items` in each language in `src/data/content.ts`, using the same stable `id` in all four dictionaries. Supply its code, title, company, location, summary, overview, responsibilities, technical approach, tools/competencies and documented scope. Existing layout and detail dialogs read these items from the data.

Use only material you are allowed to publish. Describe results only when supported by reliable information. The current illustrations explain engineering concepts; they are not customer facility layouts.

## Replace the portrait and other images

Replace `public/portrait.jpg` with an approved real portrait, or update its path in `src/config.ts`. The supplied CV portrait is 400 × 400 pixels and is used as a small profile image; provide a larger professional photograph if you want a larger crop. The site does not use a generated likeness.

Keep image dimensions and file sizes reasonable. Add meaningful alternative text where new informative imagery is rendered. `public/favicon.svg` contains the DJ initials. Social sharing uses `og-cover.png` when present, with `og-cover.svg` as a build-time fallback. A 1200 × 630 PNG is recommended for broad social preview support.

## Update the downloadable CV

The résumé link points to the actual PDF at `public/Dusan-Jankovic-CV.pdf`. Replace that file with an approved version using the same filename, or update `profile.resume` in `src/config.ts`.

The provided original CV contains a full address, date of birth and personal phone number. Keep those details out of the public download by default. Use a sanitized public CV, review the PDF itself before committing it, and ensure redaction removes underlying text rather than only covering it visually. A file in `public/` is accessible to every site visitor and to anyone viewing a public source repository.

## LogEN content to confirm

LogEN is identified as an independent software project in the supplied brief. The CV does not establish which listed capabilities are implemented. The showcase is therefore labeled as an illustrative interface concept, with feature concepts pending confirmation. It does not expose source code, proprietary algorithms, private repositories or customer data.

To complete this section with product evidence, provide approved screenshots, confirm the implemented feature list, distinguish features still in development and optionally supply an approved public URL. Update all four dictionaries and the accompanying labels together. Until a URL is approved, the LogEN button uses the contact section.

## Add a language

Add the language code to `Lang`, an entry to `languageNames`, and a complete `Content` dictionary in `src/data/content.ts`. Register the dictionary in the exported `content` object. Translate all visible prose, labels, dates and accessibility text; keep proper names and factual scope consistent. Test long text at mobile widths and verify dialogs, layer controls and contact buttons in the new language.

## Review before publishing changes

Run `npm run build`, then review the production preview on desktop and a narrow mobile viewport. Check the console, four language choices, light/dark themes, navigation, résumé download, LinkedIn link, project dialogs, keyboard interaction and warehouse controls. Check motion with the system’s reduced-motion preference enabled. If enabling public email or a LogEN destination, verify the resulting link.

Source content still needing owner confirmation: current employment, approved public email display, LogEN implementation status/screenshots and any future measurable project outcomes. No quantified operational achievements or language proficiency levels have been invented.

