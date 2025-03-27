import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import ejs from 'ejs';
import { execa } from 'execa'; // Правильный импорт для execa@8+

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, 'templates');

async function setupLinting(projectPath, options) {
  try {
    console.log(chalk.blue('\n🔧 Настройка ESLint...'));
    const eslintConfig = await fs.readFile(
      path.join(TEMPLATES_DIR, 'shared/eslintrc.cjs.ejs'),
      'utf-8',
    );
    await fs.writeFile(path.join(projectPath, '.eslintrc.cjs'), ejs.render(eslintConfig, options));
  } catch (error) {
    console.log(chalk.yellow('⚠️ Ошибка настройки ESLint:'), error.message);
  }
}

async function setupTypeScript(projectPath, options) {
  try {
    if (options.typescript) {
      console.log(chalk.blue('\n🔧 Настройка TypeScript...'));
      const tsConfig = await fs.readFile(
        path.join(TEMPLATES_DIR, 'shared/tsconfig.json.ejs'),
        'utf-8',
      );
      await fs.writeFile(path.join(projectPath, 'tsconfig.json'), ejs.render(tsConfig, options));
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️ Ошибка настройки TypeScript:'), error.message);
  }
}

async function installDependencies(projectPath) {
  try {
    console.log(chalk.blue('\n📦 Установка зависимостей...'));
    await execa('npm', ['install'], {
      cwd: projectPath,
      stdio: 'inherit',
    });
  } catch (error) {
    console.log(chalk.yellow('⚠️ Ошибка установки зависимостей:'), error.message);
  }
}

async function runPostActions(projectPath, options) {
  if (options.eslintPrettier) {
    try {
      console.log(chalk.blue('\n🔧 Запуск eslint --fix...'));
      await execa('npx', ['eslint', '--fix', '.'], {
        cwd: projectPath,
        stdio: 'inherit',
      });
    } catch (error) {
      console.log(chalk.yellow('⚠️ ESLint --fix завершился с предупреждениями'));
    }
  }

  if (options.gitInit) {
    try {
      console.log(chalk.blue('\n🔧 Инициализация Git...'));
      await execa('git', ['init'], {
        cwd: projectPath,
        stdio: 'inherit',
      });
    } catch (error) {
      console.log(chalk.yellow('⚠️ Ошибка инициализации Git:'), error.message);
    }
  }
}

export default async function createProject(projectName, cliOptions = {}) {
  try {
    // 1. Валидация и создание директории
    const projectPath = path.resolve(process.cwd(), projectName);
    if (await fs.pathExists(projectPath)) {
      throw new Error(`Директория "${projectName}" уже существует`);
    }
    await fs.ensureDir(projectPath);

    // 2. Настройка шаблонов
    const options = { ...cliOptions, projectName };
    await fs.copy(path.join(TEMPLATES_DIR, options.framework), projectPath);

    // 3. Генерация конфигов
    await setupTypeScript(projectPath, options);
    await setupLinting(projectPath, options);

    // 4. Установка зависимостей и post-actions
    await installDependencies(projectPath);
    await runPostActions(projectPath, options);

    console.log(chalk.green(`\n✅ Проект ${chalk.bold(projectName)} готов!`));
    console.log(chalk.blue(`\nСледующие шаги:\n`));
    console.log(`cd ${projectName}`);
    console.log(`npm run dev`);
  } catch (error) {
    throw new Error(chalk.red(`Ошибка: ${error.message}`));
  }
}
