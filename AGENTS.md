# Agent guidelines

Coriolis Web is the web UI for Coriolis, which migrates VMs between
clouds. It is a React 18 + TypeScript app with MobX 5 stores, served by
a small Express server (`server/`). Target Node 22 (CI) and Yarn 3.
The backend lives in a separate repo (`coriolis`). Do not add behaviour
here that the API does not support.

## Coriolis terminology

- **Minion**: temporary worker VM for disk transfer and os-morphing
  (guest prep: network, packages, drivers). **Minion pools** reuse them.
- **Transfer**: creates destination volumes and copies disk data.
  Re-run a transfer as a new **execution** to pick up later changes.
- **Deployment**: creates the destination VM from a completed transfer.
- **Replica** vs **migration** (`transfer.scenario`: `replica` /
  `live_migration`) is a licensing split, not two engines. The UI labels
  and counts them separately (Dashboard, Endpoints).

Users configure source/destination **endpoints** (credentials) and
**environment options** (transfer and resulting VM settings). Provider
specific UI lives in `src/plugins/<provider>`.


## Working in this repo

- Install with `corepack enable && yarn install`. Ignore `node_modules`,
  `dist`, `coverage`, `.yarn/cache`.
- CI (`.github/workflows/build.yml`) runs, in order: `npm run tsc`,
  `npm run eslint`, `npm run format` (Prettier, `arrowParens: avoid`),
  `npm run test`, `npm run build:dev`, `npm run e2e`. Run the relevant
  ones before handing work back.
- Use the repo's Prettier (`yarn prettier`), not a global `npx` one. A
  different version reformats unrelated code.
- Source files need the AGPL license header (copy from a nearby file and
  use the current year for new files).
- Follow existing patterns: class components with MobX decorators, no
  new state libraries or hooks-only rewrites of existing components.
- Do not add helpers for trivial checks such as
  `transfer.scenario === "replica"`; keep those inline.
- Do not strip still-relevant inline comments.
- If regenerating a file, replace its contents; do not append duplicates.
- Avoid unrelated refactors and formatting changes in touched files.

## Tests

- Unit tests: Jest + React Testing Library, files named `*.spec.tsx`
  next to the code (only that pattern runs). Use `TestUtils` from
  `@tests/TestUtils` to select styled elements by class prefix.
- Mock sources and stores with `jest.mock("@src/...")` at the top of the
  file; do not hit the network.
- E2E: Cypress specs in `cypress/e2e/<area>/*.cy.ts`. All API calls are
  mocked with `cy.intercept` using `routeSelectors` and fixtures in
  `cypress/fixtures`; use `cy.mockAuth()` / `cy.waitMockAuth()` for login.
  Run with `NODE_ENV=development`, `CORIOLIS_URL=http://invalidd.it/`,
  `npm run build:dev && npm run start`, then `npm run e2e`.
- Match nearby tests in style and level of detail.
