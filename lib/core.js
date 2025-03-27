import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import ejs from 'ejs';
import { execa } from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, 'templates');

async function generateConfigFiles(projectPath, options) {
  try {
    // Генерация tsconfig.json для TypeScript
    if (options.typescript) {
      const tsConfig = await fs.readFile(
        path.join(TEMPLATES_DIR, 'shared/tsconfig.json.ejs'),
        'utf-8'
      );
      await fs.writeFile(
        path.join(projectPath, 'tsconfig.json'),
        ejs.render(tsConfig, options)
      );
    }

    // Генерация ESLint/Prettier конфигов
    if (options.eslintPrettier) {
      const eslintConfig = await fs.readFile(
        path.join(TEMPLATES_DIR, 'shared/eslintrc.cjs.ejs'),
        'utf-8'
      );
      await fs.writeFile(
        path.join(projectPath, '.eslintrc.cjs'),
        ejs.render(eslintConfig, options)
      );

      const prettierConfig = await fs.readFile(
        path.join(TEMPLATES_DIR, 'shared/prettierrc.json.ejs'),
        'utf-8'
      );
      await fs.writeFile(
        path.join(projectPath, '.prettierrc.json'),
        prettierConfig
      );
    }
  } catch (error) {
    throw new Error(`Ошибка генерации конфигов: ${error.message}`);
  }
}

async function installDependencies(projectPath) {
  try {
    console.log(chalk.blue('\n📦 Установка зависимостей...'));
    await execa('npm', ['install'], {
      cwd: projectPath,
      stdio: 'inherit'
    });
  } catch (error) {
    console.log(chalk.yellow('⚠️ Ошибка установки зависимостей:'), error.message);
  }
}

async function runPostActions(projectPath, options) {
  try {
    // Запуск ESLint --fix
    if (options.eslintPrettier) {
      console.log(chalk.blue('\n🔧 Запуск eslint --fix...'));
      await execa('npx', ['eslint', '--fix', '.'], {
        cwd: projectPath,
        stdio: 'inherit'
      });
    }

    // Инициализация Git
    if (options.gitInit) {
      console.log(chalk.blue('\n🔧 Инициализация Git...'));
      await execa('git', ['init'], {
        cwd: projectPath,
        stdio: 'inherit'
      });
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️ Post-actions завершились с предупреждениями:'));
    console.log(chalk.yellow(error.message));
  }
}

export default async function createProject(projectName, cliOptions = {}) {
  try {
    // Валидация имени проекта
    if (!projectName || !/^[a-z0-9-]+$/i.test(projectName)) {
      throw new Error('Некорректное имя проекта. Используйте только буквы, цифры и дефисы');
    }

    const projectPath = path.resolve(process.cwd(), projectName);

    // Проверка существования директории
    if (await fs.pathExists(projectPath)) {
      throw new Error(`Директория "${projectName}" уже существует`);
    }

    // Подготовка опций
    const options = {
      projectName,
      framework: cliOptions.framework || 'react',
      typescript: cliOptions.typescript || false,
      eslintPrettier: cliOptions.eslintPrettier || false,
      jest: cliOptions.jest || false,
      gitInit: cliOptions.gitInit !== false
    };

    console.log(chalk.cyan('\n🛠  Создание проекта с настройками:'));
    console.log('─'.repeat(50));
    console.log('Тип:', chalk.bold(options.framework));
    console.log('TypeScript:', chalk.bold(options.typescript ? 'Да' : 'Нет'));
    console.log('ESLint/Prettier:', chalk.bold(options.eslintPrettier ? 'Да' : 'Нет'));
    console.log('─'.repeat(50));

    // Создание директории проекта
    await fs.ensureDir(projectPath);

    // Копирование шаблонов
    await fs.copy(
      path.join(TEMPLATES_DIR, options.framework),
      projectPath
    );

    // Генерация конфигурационных файлов
    await generateConfigFiles(projectPath, options);

    // Установка зависимостей
    await installDependencies(projectPath);

    // Post-actions
    await runPostActions(projectPath, options);

    // Финальное сообщение
    console.log(chalk.green(`\n✅ Проект ${chalk.bold(projectName)} успешно создан!`));
    console.log(chalk.blue('\nСледующие шаги:\n'));
    console.log(`cd ${projectName}`);
    console.log(`npm run dev`));

    return { projectPath, options };
  } catch (error) {
    throw new Error(chalk.red(`Ошибка при создании проекта: ${error.message}`));
  }
}
