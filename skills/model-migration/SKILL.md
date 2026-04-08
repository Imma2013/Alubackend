---
name: model-migration
description: "Migrate code, prompts, and AI model references when upgrading between Claude model versions or switching Gemini model generations. Use when updating model IDs, adjusting prompt patterns for new model capabilities, or resolving deprecation warnings after a model upgrade."
---

# Model Migration

Safely migrate code and prompts when upgrading AI model versions (e.g., Claude Sonnet → Opus, Gemini 2.x → 3.x).

## Workflow

### Step 1: Audit Current Model References

Find all model identifiers, API calls, and prompt patterns in the codebase:

```bash
# Find model ID strings
grep -rn "gemini-\|claude-\|gpt-\|veo-" --include="*.js" --include="*.ts" --include="*.json" --include="*.env*" .

# Find prompt templates and system instructions
grep -rn "system.*prompt\|SYSTEM_PROMPT\|systemInstruction" --include="*.js" --include="*.ts" .
```

### Step 2: Map Old → New Model IDs

Create a migration table for each model reference found:

| Location | Old Model ID | New Model ID | Notes |
|----------|-------------|-------------|-------|
| `server.js:42` | `gemini-2.5-flash` | `gemini-3-flash-preview` | Text model fallback |
| `.env` | `claude-sonnet-4-5-20250514` | `claude-opus-4-5-20250918` | API key unchanged |

### Step 3: Update References

1. Replace model ID strings in source files and environment configs
2. Update any model-specific parameters (temperature defaults, token limits, safety settings)
3. Adjust prompt patterns if the new model handles instructions differently

### Step 4: Validate

```bash
# Verify no stale model IDs remain
grep -rn "OLD_MODEL_ID" --include="*.js" --include="*.ts" --include="*.json" .

# Run existing tests
npm test

# Check for deprecation warnings in logs
npm run dev 2>&1 | head -50 | grep -i "deprecat\|warn"
```

### Step 5: Test Key Flows

Run through critical AI-dependent paths manually or via E2E tests to confirm output quality has not regressed after the model swap.
