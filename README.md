# CasperID Web

Landing, account, business, and admin share one React application in `frontend/`.
Run `cd frontend && npm ci && npm run dev`. Development API requests proxy to localhost:3001; production builds use `VITE_API_URL`.
Validate with `npm run type-check`, `npm run test:run -- --pool=threads --maxWorkers=2`, and `npm run build`.
CNS pricing is loaded from `/api/cns/plans`; the bundled snapshot supports older API versions during migration.

This migration is prepared on `migration/web-repository`. Keep it off production `main` until cutover is approved. The former Cloud Run workflow is removed only on this branch; the production branch and service remain unchanged.
Existing Render staging: repository CasperID, branch migration/web-repository, root frontend, build `npm ci && npm run build`, publish dist. Retain existing environment values and set `VITE_API_URL` to the existing staging API.

Staging CI/CD uses the existing Render service with auto-deploy set to `checksPass`: pushes to its configured branch deploy only after GitHub checks pass. `Verify staging` is a separate manual workflow that checks the exact deployed revision. No deployment hook or production secret is needed.
