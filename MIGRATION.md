# Web repository migration

The Web-only branch was prepared from https://github.com/luxipha/CasperID at
source commit 5ddb5ea9134a18010614ba9ee249315a5f0d64f0. Component source and relevant
history are published in the repositories linked from README.md. Existing local
source changes and previously ignored tests were carried into the split workspace.

The old monorepo component folders, root backend/Next.js setup, generated diagnostic
output, and Cloud Run workflow are removed from the current Web source. Original
Git history is retained; this cleanup does not purge historical files or credentials.

Vercel may automatically deploy Web when this change reaches main. The running
production API remains in place; its next deployment must use CasperID-api.
Keep environment values, private keys, database exports, and credentials untracked.
