# CasperID Web

Landing, account, business, and admin share one React application in `frontend/`.

## Local development

Use Node 24 and npm 11.6.1. Copy `frontend/.env.example` to `frontend/.env.local`,
then run `npm ci` and `npm run dev` inside `frontend/`. Start the independently
configured API from the CasperID-api repository on port 3001. Development API
requests proxy to localhost:3001; production builds use `VITE_API_URL`.

Validate inside `frontend/` with `npm run type-check`,
`npm run test:run -- --pool=threads --maxWorkers=1`, and `npm run build`.
CNS pricing comes from `/api/cns/plans`; a bundled snapshot supports older API versions.

## Repository boundaries

This repository owns Web source and Web deployment configuration. Other projects
have independent repositories:

- [API](https://github.com/luxipha/CasperID-api)
- [React and React Native SDK](https://github.com/luxipha/CasperID-sdk)
- [Mobile](https://github.com/luxipha/CasperID-mobile)
- [Extension](https://github.com/luxipha/CasperID-extension)
- [Contracts](https://github.com/luxipha/CasperID-contracts)
- [CasperDrop](https://github.com/luxipha/CasperDrop)

Open the parent `casperid.code-workspace` for local development across sibling clones.
No project requires sibling source imports. Do not place credentials or recovery
snapshots in this repository.

## Deployment

Vercel production follows `main` and builds the existing `frontend/` application.
The former monorepo Cloud Run workflow is retired here; merging Web changes does
not redeploy the running API. Future API deployments belong to CasperID-api.

The existing Render Web staging service uses root `frontend`, build command
`npm install --global npm@11.6.1 && npm ci && npm run build`, publish directory `dist`,
and the existing staging API URL. Its `checksPass` trigger waits for GitHub checks.
The manual `Verify staging` workflow checks the exact deployed revision; run it on
the branch/revision configured for that staging service.
