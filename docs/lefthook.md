# Lefthook setup and usage

This project uses Lefthook to manage Git hooks. We run fast checks on `pre-commit` and validate commit messages with `commitlint`.

What changed:
- `pre-commit` runs `pnpm biome check --write .` which formats and fixes issues when possible.
- `commit-msg` runs `pnpm commitlint --edit {1}` to validate conventional commits.
- A `postinstall` script was added to `package.json` to run `lefthook install` automatically for new clones.

Developer notes:
- Install dependencies with pnpm or npm as usual. After install, lefthook will be installed automatically via `postinstall`.
- If hooks are not installed (e.g., you use a different package manager), run manually:

```bash
# with pnpm
pnpm install
npx lefthook install

# or with npm
npm install
npx lefthook install
```

Troubleshooting:
- If lefthook shows old scripts, remove the `.git/hooks` entries and rerun `npx lefthook install`.
- If you need the previous behavior (tests on push), run tests locally or rely on CI.

Acceptance:
- Pre-commit should auto-format staged files and block commits with unfixable issues.
- Commit messages violating Conventional Commits should be rejected.
