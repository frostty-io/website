# Frostty Website

Marketing site + docs for Frostty, built with Next.js (TypeScript), Nextra Docs Theme, and Tailwind CSS.

## Local development

```bash
pnpm install
pnpm run dev
```

## Static export

```bash
pnpm run build
```

The static output is generated in `out/` (`output: "export"` in `next.config.mjs`).
Search index files are generated into `out/_pagefind/` during `postbuild`.
