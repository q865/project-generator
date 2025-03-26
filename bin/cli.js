#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const { createProject } = require('../lib/core');
const { version } = require('../package.json');

program
  .name('project-generator')
  .description('CLI для генерации проектов с ESLint, Prettier и Jest')
  .version(version, '-v, --version');

program
  .command('create <project-name>')
  .description('Создать новый проект')
  .option('-t, --type <type>', 'Тип проекта (react, nextjs, express, vanilla)')
  .option('--ts, --typescript', 'Использовать TypeScript')
  .action(async (projectName, options) => {
    try {
      await createProject(projectName, options);
      console.log(`✅ Проект ${projectName} успешно создан!`);
    } catch (error) {
      console.error('❌ Ошибка:', error.message);
      process.exit(1);
    }
  });

program.parseAsync(process.argv).catch((err) => {
  console.error('❌ Critical error:', err);
  process.exit(1);
});
