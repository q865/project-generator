import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import ejs from 'ejs';
import { validateProjectName } from './utils/validators.js';
import { promptUser } from './utils/prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATES_DIR = path.join(__dirname, 'templates');

export default async function createProject(projectName) {
  try {
    // Валидация и создание директории
    validateProjectName(projectName);
    const projectPath = path.resolve(process.cwd(), projectName);
    await fs.ensureDir(projectPath);

    // Получаем настройки от пользователя
    const options = await promptUser(projectName);

    if (!fs.existsSync(path.join(TEMPLATES_DIR, options.framework))) {
      throw new Error(`Шаблон для ${options.framework} не найден`);
    }
    if (options.typescript) {
      const tsConfig = await fs.readFile(
        path.join(TEMPLATES_DIR, 'shared/tsconfig.json.ejs'),
        'utf-8',
      );
      await fs.writeFile(path.join(projectPath, 'tsconfig.json'), ejs.render(tsConfig));
    }
    // Копируем соответствующий шаблон
    const templatePath = path.join(TEMPLATES_DIR, options.framework);
    await fs.copy(templatePath, projectPath);

    // Генерируем динамические файлы (package.json)
    const pkgTemplate = await fs.readFile(path.join(templatePath, 'package.json.ejs'), 'utf-8');
    const pkgContent = ejs.render(pkgTemplate, {
      projectName,
      ...options,
    });

    await fs.writeFile(path.join(projectPath, 'package.json'), pkgContent);

    console.log(chalk.green(`\n✅ Проект ${chalk.bold(projectName)} создан!`));
    console.log(chalk.blue(`\nСледующие шаги:\n`));
    console.log(`cd ${projectName}`);
    console.log(`npm install`);
    console.log(`npm run dev`);
  } catch (error) {
    throw new Error(chalk.red(`Ошибка: ${error.message}`));
  }
}
