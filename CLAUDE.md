# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the official Claude Code repository by Anthropic. It contains:
- **Official plugins** in `plugins/` - extending Claude Code with commands, agents, hooks, and skills
- **Example hooks** in `examples/hooks/` - sample hook implementations
- **Issue management scripts** in `scripts/` - TypeScript/Bun scripts for GitHub issue automation
- **GitHub workflows** in `.github/workflows/` - CI/CD for issue triage, duplicate detection, and @claude mentions

## Plugin Architecture

Plugins follow a standard structure:
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json      # Manifest with name, version, description, author
├── commands/            # Slash commands (markdown files with frontmatter)
├── agents/              # Specialized agents (markdown with systemPrompt)
├── skills/              # Knowledge/guidance for Claude (SKILL.md + resources)
├── hooks/               # Event handlers (hooks.json + scripts)
└── README.md
```

### Key Plugin Components

**Commands** - User-invoked via `/plugin-name:command`. Frontmatter includes `allowed-tools`, `description`, `argument-hint`.

**Agents** - Autonomous task handlers triggered by scenario matching. Defined with `identifier`, `whenToUse` (with `<example>` blocks), and `systemPrompt`.

**Skills** - Third-person descriptions that load contextual knowledge. Use progressive disclosure with `references/` for detailed content.

**Hooks** - Event-driven automation for `PreToolUse`, `PostToolUse`, `SessionStart`, `Stop`. Can be prompt-based or command-based.

## Available Plugins

| Plugin | Purpose |
|--------|---------|
| `agent-sdk-dev` | Agent SDK development tools |
| `code-review` | Automated PR review with confidence scoring |
| `commit-commands` | Git workflow automation (`/commit`, `/commit-push-pr`) |
| `feature-dev` | 7-phase feature development workflow |
| `hookify` | Create custom hooks from conversation patterns |
| `plugin-dev` | Plugin creation toolkit with validators |
| `pr-review-toolkit` | Specialized PR review agents |
| `ralph-wiggum` | Iterative AI loops for development |
| `security-guidance` | Security pattern warnings on edits |

## Issue Management

The repository uses automated issue management:

- `scripts/auto-close-duplicates.ts` - Auto-closes duplicate issues after 3 days with no objection
- `scripts/comment-on-duplicates.sh` - Posts duplicate detection comments
- `.claude/commands/dedupe.md` - Find duplicates using parallel search agents
- `.claude/commands/oncall-triage.md` - Label critical issues for oncall

## GitHub Actions

Key workflows:
- `claude.yml` - Responds to @claude mentions in issues/PRs
- `claude-dedupe-issues.yml` - Automated duplicate detection
- `claude-issue-triage.yml` - Issue categorization
- `oncall-triage.yml` - Critical issue labeling

## Development Environment

The devcontainer provides a sandboxed environment with:
- Node.js with 4GB memory limit
- Zsh shell with git-delta
- Network isolation via firewall rules
- Claude Code VSCode extension

## Conventions

- Plugin names use kebab-case
- Command frontmatter uses YAML with `allowed-tools` specifying permitted tools
- Agents use `${CLAUDE_PLUGIN_ROOT}` for portable paths
- Hook exit codes: 0 = success, 1 = show error to user, 2 = block and show to Claude
- Skills written in third-person with imperative body text
