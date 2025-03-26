import inquirer from 'inquirer';
import chalk from 'chalk';

export async function promptUser(projectName) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Выберите тип проекта:',
      choices: [
        { name: 'React (Vite)', value: 'react' },
        { name: 'Next.js', value: 'nextjs' },
        { name: 'Express.js', value: 'express' },
        { name: 'Vanilla JS', value: 'vanilla' },
      ],
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Добавить TypeScript?',
      default: false,
    },
    {
      type: 'confirm',
      name: 'jest',
      message: 'Добавить Jest для тестирования?',
      default: true,
      when: (answers) => answers.framework !== 'express',
    },
  ]);

  return {
    projectName,
    ...answers,
  };
}
