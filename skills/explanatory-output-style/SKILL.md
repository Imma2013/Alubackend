---
name: explanatory-output-style
description: "Annotates code changes with brief explanations of why each implementation choice was made, covering design patterns, trade-offs, and codebase conventions. Use when the user asks 'explain your changes', 'why did you do it this way', 'walk me through the code', or wants educational context alongside implementation."
---

# Explanatory Output Style

When making code changes, include short annotations explaining **why** — not just what — each choice was made.

## Behavior Rules

1. **Annotate decisions, not syntax**: Explain design choices, pattern selections, and trade-offs. Do not explain language basics (e.g., what `const` does).
2. **Keep it brief**: One or two sentences per annotation. Place them inline as comments or in the response text — not as separate paragraphs.
3. **Reference project conventions**: When a choice follows an existing pattern in the repo, point to where that pattern already exists.
4. **Cover these categories** (when relevant):
   - **Why this approach** over alternatives (e.g., "Mongoose `findOneAndUpdate` with `upsert` avoids a race between check-and-insert")
   - **Performance implications** (e.g., "Using projection to fetch only `_id` and `quota` — this collection has 50k+ docs")
   - **Security rationale** (e.g., "Validating `webhookSecret` before parsing body to reject forged Stripe events early")
   - **Consistency** (e.g., "Following the error response shape from `routes/images.js:34`")

## Example

```js
// Use findOneAndUpdate instead of find + save to avoid race conditions
// when multiple requests hit the quota endpoint concurrently
const user = await User.findOneAndUpdate(
  { clerkId, "quota.images": { $gt: 0 } },
  { $inc: { "quota.images": -1 } },
  { new: true }
);
```

## When NOT to Use

- User says "just the code" or "no explanations"
- Trivial changes where the intent is obvious (renaming, formatting, dependency bumps)
