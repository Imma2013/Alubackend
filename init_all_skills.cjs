const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const skills = [
  {
    name: "agent-sdk-dev",
    description: "Development kit for working with the Claude Agent SDK"
  },
  {
    name: "claude-opus-4-5-migration",
    description: "Migrate your code and prompts from Sonnet 4.x and Opus 4.1 to Opus 4.5."
  },
  {
    name: "code-review",
    description: "Automated code review for pull requests using multiple specialized agents with confidence-based scoring to filter false positives"
  },
  {
    name: "commit-commands",
    description: "Commands for git commit workflows including commit, push, and PR creation"
  },
  {
    name: "explanatory-output-style",
    description: "Adds educational insights about implementation choices and codebase patterns (mimics the deprecated Explanatory output style)"
  },
  {
    name: "feature-dev",
    description: "Comprehensive feature development workflow with specialized agents for codebase exploration, architecture design, and quality review"
  },
  {
    name: "frontend-design",
    description: "Create distinctive, production-grade frontend interfaces with high design quality. Generates creative, polished code that avoids generic AI aesthetics."
  },
  {
    name: "hookify",
    description: "Easily create custom hooks to prevent unwanted behaviors by analyzing conversation patterns or from explicit instructions. Define rules via simple markdown files."
  },
  {
    name: "learning-output-style",
    description: "Interactive learning mode that requests meaningful code contributions at decision points (mimics the unshipped Learning output style)"
  },
  {
    name: "plugin-dev",
    description: "Comprehensive toolkit for developing Claude Code plugins. Includes 7 expert skills covering hooks, MCP integration, commands, agents, and best practices. AI-assisted plugin creation and validation."
  },
  {
    name: "pr-review-toolkit",
    description: "Comprehensive PR review agents specializing in comments, tests, error handling, type design, code quality, and code simplification"
  },
  {
    name: "ralph-wiggum",
    description: "Interactive self-referential AI loops for iterative development. Claude works on the same task repeatedly, seeing its previous work, until completion."
  },
  {
    name: "security-guidance",
    description: "Security reminder hook that warns about potential security issues when editing files, including command injection, XSS, and unsafe code patterns"
  }
];

const initScriptPath = "C:\\Users\\Admin\\AppData\\Roaming\\npm\\node_modules\\@google\\gemini-cli\\node_modules\\@google\\gemini-cli-core\\dist\\src\\skills\\builtin\\skill-creator\\scripts\\init_skill.cjs";
const baseDir = path.join(process.cwd(), 'skills');

skills.forEach(skill => {
  console.log(`Initializing ${skill.name}...`);
  try {
    execSync(`node "${initScriptPath}" ${skill.name} --path "${baseDir}"`, { stdio: 'inherit' });
    
    // Update SKILL.md with description
    const skillMdPath = path.join(baseDir, skill.name, 'SKILL.md');
    const content = `---
name: ${skill.name}
description: ${skill.description}
---

# ${skill.name}

${skill.description}

## Instructions

(Add detailed instructions here)
`;
    fs.writeFileSync(skillMdPath, content, 'utf8');
    
    // Cleanup example files
    const skillPath = path.join(baseDir, skill.name);
    const assetPath = path.join(skillPath, 'assets', 'example_asset.txt');
    const refPath = path.join(skillPath, 'references', 'example_reference.md');
    const scriptPath = path.join(skillPath, 'scripts', 'example_script.cjs');
    
    if (fs.existsSync(assetPath)) fs.unlinkSync(assetPath);
    if (fs.existsSync(refPath)) fs.unlinkSync(refPath);
    if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);

  } catch (error) {
    console.error(`Failed to initialize ${skill.name}:`, error.message);
  }
});