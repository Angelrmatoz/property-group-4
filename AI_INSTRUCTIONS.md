# AI Instructions for this repository

This repository defines a clear set of instructions for automated agents and human reviewers to follow when making edits, running dependency commands, or performing security-sensitive actions.

Key expectations for any AI agent (or human acting on behalf of an AI):

- After any file edit, run Codacy analysis for every modified file. If Codacy reports issues in your edits, fix them immediately.
- If you add or change dependencies, run the security scan (Trivy) and address any vulnerabilities before proceeding.
- Do not print, commit, or expose secrets. If a secret is found, remove it from the repo and the git history and notify maintainers.
- Avoid large unrelated refactors. Keep changes minimal and scoped to the task.
- Use the repo TODO workflow (`.manage_todo_list`) to track progress. Only one TODO should be `in-progress` at a time.

If a required tool (Codacy CLI, Trivy) is missing or unreachable, pause and ask a human maintainer for help. The fallback behavior is documented in `.github/ai-instructions/ai-policy.yaml`.

Maintainers: replace the `contact` field in `.github/ai-instructions/ai-policy.yaml` with the proper notification target.
