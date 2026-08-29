<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Development Process Rules

For every new feature requested by the user, you MUST check the following files before proceeding:

- `build-phases.md` - for timeline context and progression
- `database-schema.md` - for database context
- `oreo-design-spec.md` - for design context and specifications
- `SRS-personal-finance-app.md` - for overarching functional requirements

Create implementation plan after and we'll go from there with my approval, ask open questions to further refine and clarify the plan before we proceed.

<!-- END:nextjs-agent-rules -->
