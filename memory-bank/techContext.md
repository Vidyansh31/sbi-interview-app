# Technical Context

## Environment & Tooling
- **OS**: Windows (win32-x64)
- **Node Package Manager**: npm
- **Framework**: Next.js 16.4.2
- **React**: 19.3.0
- **TypeScript**: 5.x
- **Bundler**: Turbopack (`next dev`, `next build`)
- **Native SWC Dependency**: `@next/swc-win32-x64-msvc` installed in `devDependencies` to ensure Turbopack operates properly on Windows.

## Key Configuration Files
- `package.json`: Main project dependencies and build scripts (`dev`, `build`, `start`, `lint`).
- `tsconfig.json`: TypeScript configurations with path alias `@/*` mapped to `./src/*`.
- `next.config.ts`: Next.js config enabling `@tailwindcss/turbopack`, `cacheComponents`, and `partialPrefetching`.
- `src/app/globals.css`: Base Tailwind imports and `:root` color tokens (enforced `#ffffff` background and `#0f172a` foreground).

## Common Commands
- Development server: `npm run dev`
- Production build: `npm run build`
- Run linting: `npm run lint`
