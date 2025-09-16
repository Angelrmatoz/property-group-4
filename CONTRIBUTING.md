# Contributing

Please follow these repository guidelines when contributing code or running automated agents (AI):

- Read `AI_INSTRUCTIONS.md` and `.github/ai-instructions/ai-policy.yaml` before running automated edits.
- After any edits, run Codacy analysis for modified files and address any flagged issues.
- If you add or change dependencies, run the recommended security scan (Trivy) and resolve any critical/important findings.
- Use the provided PR template which includes an AI/Automation checklist.

If you are integrating an AI, ensure it obeys the rules in `.github/ai-instructions/ai-policy.yaml` and populates TODOs via the repository `manage_todo_list` workflow.
