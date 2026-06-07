# Repository Guidelines

## Project Structure & Module Organization

This repository is a pnpm workspace for a React keyboard component library. Core source lives in `src/`: `flick-keyboard.tsx` contains the main component and helpers, `cn.ts` contains class-name utilities, and `index.ts` is the public export surface. Tests are colocated in `src/` with `*.test.tsx` names. Build output is generated in `dist/` and should not be edited directly. The `example/` package is a Vite + React + Tailwind demo that consumes `jp-flick-keyboard` through the workspace dependency.

## Build, Test, and Development Commands

Use pnpm 11 (`packageManager` is `pnpm@11.0.6`).

- `pnpm install`: install workspace dependencies.
- `pnpm build`: bundle the library with tsup into `dist/` as ESM, CJS, and declarations.
- `pnpm dev`: run tsup in watch mode for library development.
- `pnpm typecheck`: run TypeScript with `--noEmit`.
- `pnpm test`: run Vitest once.
- `pnpm test:watch`: run Vitest in watch mode.
- `pnpm check`: run Biome diagnostics.
- `pnpm check:fix`: apply safe Biome fixes.
- `pnpm example:dev`: start the Vite example app.
- `pnpm example:build`: typecheck and build the example app.

## Coding Style & Naming Conventions

The project uses TypeScript, React, ESM modules, and Biome. Biome formats with spaces and a 120-character line width. Filenames should be kebab-case, for example `flick-keyboard.tsx`. Default exports are disallowed except where required by tooling config and documented with a Biome ignore. Keep public exports centralized through `src/index.ts`. Tailwind class sorting is enforced for `cn`, `twMerge`, and `twJoin`.

## Testing Guidelines

Tests use Vitest, jsdom, and Testing Library React, with shared setup in `vitest.setup.ts`. Place focused tests next to the code they cover using `*.test.tsx`. Prefer user-visible assertions and event simulation through Testing Library (`screen`, `fireEvent`) over implementation details. Run `pnpm test`, `pnpm typecheck`, and `pnpm check` before submitting changes.

## Commit & Pull Request Guidelines

Recent commit subjects use short imperative summaries such as `Add Vitest test suite for FlickKeyboard` and `Fix case of example/src/app.tsx in git tree`. Keep commits scoped and describe the change, not the process. Pull requests should include a concise description, relevant issue links, commands run, and screenshots or screen recordings for UI changes in `example/`.

## Security & Configuration Tips

Do not commit generated dependency folders or local secrets. Read and edit text files as UTF-8. Keep package metadata aligned with the built `dist/` entry points when changing exports, peer dependencies, or build configuration.
