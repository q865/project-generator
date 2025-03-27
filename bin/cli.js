#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');

program.name('project-generator').description('CLI для генерации проектов').version(version);

program
  .command('create <project-name>')
  .description('Создать новый проект')
  .option('--typescript', 'Добавить TypeScript поддержку')
  .option('--eslint-prettier', 'Добавить ESLint + Prettier')
  .option('--jest', 'Добавить Jest для тестирования')
  .action(async (projectName, options) => {
    try {
      const { default: createProject } = await import('../lib/core.js');
      await createProject(projectName, options);
    } catch (error) {
      console.error(chalk.red('❌ Ошибка:'), error.message);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
