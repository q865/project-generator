import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createProject(projectName) {
  try {
    console.log(chalk.yellow('\n⚙️  Создание проекта...'));

    const projectPath = path.resolve(process.cwd(), projectName);
    await fs.ensureDir(projectPath);

    console.log(chalk.green(`✅ Проект создан в ${projectPath}`));
  } catch (error) {
    console.error(chalk.red('❌ Ошибка:'), error.message);
    throw error;
  }
}

export default createProject;
