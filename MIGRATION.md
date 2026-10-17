# Repository extraction

This repository was extracted from https://github.com/luxipha/CasperID at source commit 5ddb5ea9134a18010614ba9ee249315a5f0d64f0.
Relevant commit history is retained. Existing local source changes and previously ignored tests/documentation were carried forward for review.
Repository extraction rewrites commit IDs; `.git/filter-repo/commit-map` in the preparation workspace records the mapping.
No production deployment is triggered by this migration. Staging deployment and package publishing are explicit workflows.
Never copy environment values, private keys, database exports, or local credentials into this repository.
