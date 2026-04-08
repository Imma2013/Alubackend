---
name: feature-dev
description: "End-to-end feature development from requirements to merged code. Explores the codebase, designs the architecture, implements changes across backend and frontend, and runs quality checks. Use when building a new feature, implementing a user story, or adding functionality that spans multiple files or layers."
---

# Feature Development

Build features end-to-end: explore existing code, design the approach, implement changes, and verify quality.

## Workflow

### Step 1: Understand the Requirement

Parse the feature request into:
- **What** the user wants (observable behavior)
- **Where** it fits (which routes, models, services, or UI components are affected)
- **Constraints** (auth requirements, rate limits, existing patterns to follow)

### Step 2: Explore the Codebase

Map the relevant code before writing anything:

```bash
# Find related routes
grep -rn "router\.\(get\|post\|put\|delete\)" --include="*.js" routes/

# Find related models/schemas
grep -rn "Schema\|model(" --include="*.js" .

# Check existing patterns for the feature area
ls routes/ services/ middleware/
```

### Step 3: Design the Approach

Outline the implementation plan before coding:
1. List files to create or modify
2. Define new API endpoints (method, path, request/response shape)
3. Identify shared utilities or middleware to reuse
4. Note any new environment variables or dependencies needed

Present the plan for approval before proceeding.

### Step 4: Implement

Follow existing project conventions:
- **Routes** go in `routes/<resource>.js` using Express Router
- **Business logic** goes in `services/`
- **Auth middleware** uses Clerk (`@clerk/clerk-sdk-node`)
- **Database models** use Mongoose schemas
- Add input validation at route boundaries

### Step 5: Quality Check

```bash
# Verify no syntax errors
node --check <changed-files>

# Run tests if available
npm test

# Check for common issues
grep -rn "console\.log" --include="*.js" <changed-files>  # Remove debug logs
grep -rn "TODO\|FIXME\|HACK" --include="*.js" <changed-files>  # Resolve open items
```

### Step 6: Prepare for Review

Summarize what changed, why, and how to test it manually. Include any new environment variables or setup steps the reviewer needs.
