#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');

// Правильный путь к core.js
const { default: createProject } = await import('../lib/core.js');

program
  .name('project-generator')
  .description('CLI для генерации проектов')
  .version(version)
  .configureOutput({
    outputError: (str, write) => write(chalk.red(str)),
  });

program
  .command('create <project-name>')
  .description('Создать новый проект')
  .action(async (projectName) => {
    try {
      await createProject(projectName);
      console.log(chalk.green(`✅ Проект ${projectName} успешно создан!`));
    } catch (error) {
      console.error(chalk.red('❌ Ошибка:'), error.message);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
