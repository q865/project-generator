const { prompt } = require('inquirer');
const chalk = require('chalk');

const frameworkChoices = [
  { name: 'Vanilla JavaScript', value: 'vanilla' },
  { name: 'React (Vite)', value: 'react' },
  { name: 'Next.js', value: 'nextjs' },
  { name: 'Node.js + Express', value: 'express' },
];

const cssChoices = [
  { name: 'Tailwind CSS', value: 'tailwind' },
  { name: 'Styled Components', value: 'styled' },
  { name: 'CSS Modules', value: 'modules' },
  { name: 'Обычный CSS', value: 'css' },
];

module.exports = async (defaultOptions = {}) => {
  console.log(chalk.cyan('\n🛠  Настройка проекта:\n'));

  const answers = await prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Выберите тип проекта:',
      choices: frameworkChoices,
      default: defaultOptions.type || 'react',
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Использовать TypeScript?',
      default: defaultOptions.typescript || false,
    },
    {
      type: 'list',
      name: 'css',
      message: 'Выберите CSS решение:',
      choices: cssChoices,
      when: (answers) => ['react', 'nextjs'].includes(answers.framework),
      default: 'tailwind',
    },
    {
      type: 'confirm',
      name: 'jest',
      message: 'Добавить Jest для тестирования?',
      default: true,
      when: (answers) => answers.framework !== 'express',
    },
    {
      type: 'confirm',
      name: 'eslintPrettier',
      message: 'Настроить ESLint + Prettier?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'gitInit',
      message: 'Инициализировать Git репозиторий?',
      default: true,
    },
  ]);

  return {
    ...answers,
    projectName: defaultOptions.projectName,
  };
};
