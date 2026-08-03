#!/usr/bin/env node
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { generateProject } from './generator.js';

const argName = process.argv[2]?.trim() || 'my-emma-app';

const answers = await inquirer.prompt<{ projectName: string; tailwind: boolean }>([
  {
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    default: argName,
  },
  {
    type: 'confirm',
    name: 'tailwind',
    message: 'Would you like to use Tailwind CSS?',
    default: false,
  },
]);

const projectName = answers.projectName.trim() || 'my-emma-app';

generateProject({
  projectName,
  tailwind: answers.tailwind
});

console.log(`✅ Project "${projectName}" created successfully! 🚀`);

const installAnswers = await inquirer.prompt<{ install: boolean }>([
  {
    type: 'confirm',
    name: 'install',
    message: 'Would you like to run npm install?',
    default: true,
  },
]);

if (installAnswers.install) {
  const dir = path.resolve(projectName);
  console.log(`📦 Installing dependencies in "${projectName}"...`);
  try {
    await runInstall(dir);
    console.log('✅ Dependencies installed!');
    for (const file of fs.readdirSync(dir)) {
      if (file.startsWith('emma-core-') && file.endsWith('.tgz')) {
        fs.rmSync(path.join(dir, file), { force: true });
      }
    }
  } catch {
    console.log('⚠️  npm install failed. Run "npm install" manually inside the project.');
  }
} else {
  console.log('⏭️  Skipped npm install. Run "npm install" inside the project when ready.');
}

console.log(`\n🚀 Next steps: \n`);
console.log(`  cd ${projectName} \n`);
console.log(`  npm run dev \n`);

function runInstall(cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['install'], { cwd, stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm install exited with code ${code}`));
    });
    child.on('error', reject);
  });
};