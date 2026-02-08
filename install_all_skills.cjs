const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const skillsDir = path.join(process.cwd(), 'skills');
const skills = fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());

skills.forEach(skill => {
  console.log(`Installing ${skill}...`);
  try {
    // Attempting direct directory installation to avoid tar/zip issues on Windows
    execSync(`gemini skills install "${path.join(skillsDir, skill)}" --scope user`, { stdio: 'inherit' });
    console.log(`✅ Successfully installed ${skill}`);
  } catch (error) {
    console.error(`❌ Failed to install ${skill}:`, error.message);
  }
});
