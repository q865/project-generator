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
async function setupGitHooks(projectPath, options) {
  if (!options.gitInit) return;

  try {
    // Инициализация Husky
    await execa('npx', ['husky', 'install'], {
      cwd: projectPath,
      stdio: 'inherit'
    });

    // Копирование хуков
    await fs.copy(
      path.join(TEMPLATES_DIR, 'shared/husky'),
      path.join(projectPath, '.husky')
    );

    // Настройка lint-staged
    if (options.eslintPrettier) {
      const lintStagedConfig = await fs.readFile(
        path.join(TEMPLATES_DIR, 'shared/lint-staged.config.js.ejs'),
        'utf-8'
      );
      await fs.writeFile(
        path.join(projectPath, 'lint-staged.config.js'),
        lintStagedConfig
      );
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️ Ошибка настройки Git hooks:'), error.message);
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
async function setupJest(projectPath, options) {
  if (!options.jest) return;

  const jestConfig = await fs.readFile(
    path.join(TEMPLATES_DIR, 'shared/jest/jest.config.js.ejs'),
    'utf-8'
  );
  
  await fs.writeFile(
    path.join(projectPath, 'jest.config.js'),
    ejs.render(jestConfig, {
      ...options,
      testEnvironment: options.framework === 'express' ? 'node' : 'jsdom'
    })
  );

  // Копируем пример теста
  const testExample = options.framework === 'express' ? 'node-test.js.ejs' : 'react-test.js.ejs';
  await fs.copy(
    path.join(TEMPLATES_DIR, 'shared/jest', testExample),
    path.join(projectPath, 'src', `example.${options.typescript ? 'ts' : 'js'}`)
  );
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
await setupGitHooks(projectPath, options);
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
