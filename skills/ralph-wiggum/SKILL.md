---
name: ralph-wiggum
description: "Iterative refinement loop where the agent reviews its own previous output and improves it across multiple passes until a quality threshold is met. Use when the user asks to 'keep improving', 'iterate until done', 'refine this', or wants autonomous multi-pass polishing of code, text, or designs."
---

# Ralph Wiggum — Iterative Self-Refinement

Run multiple autonomous passes on a task, reviewing and improving previous output each iteration until the result meets a defined quality bar.

## Workflow

### Step 1: Define the Task and Exit Criteria

Before starting the loop, establish:
- **Task**: What is being refined (e.g., a function, a prompt, a UI component)
- **Quality criteria**: Measurable conditions for "done" (e.g., all tests pass, no lint warnings, score above 90%)
- **Max iterations**: Hard cap to prevent infinite loops (default: 5)

### Step 2: First Pass

Complete the task to the best of current ability. Save the output to the target file(s).

### Step 3: Self-Review

Read the previous output and evaluate against the quality criteria:

```bash
# Example: check for issues in generated code
node --check <file>          # Syntax valid?
npm test                     # Tests pass?
grep -c "TODO\|FIXME" <file> # Open items remaining?
```

Document what needs improvement in a brief list.

### Step 4: Improve

Apply the improvements identified in the review. Only change what the review flagged — do not introduce unrelated modifications.

### Step 5: Check Exit Criteria

- **All criteria met?** → Done. Report the final state and number of iterations.
- **Max iterations reached?** → Stop. Report current state and remaining issues.
- **Otherwise** → Return to Step 3.

## Guardrails

- Never modify files outside the task scope between iterations
- Log what changed in each iteration so the user can trace the refinement
- If two consecutive passes produce no meaningful improvement, stop early and explain why
