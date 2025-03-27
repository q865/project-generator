import chalk from 'chalk';

export function validateProjectName(name) {
  if (!name) {
    throw new Error('Имя проекта не может быть пустым');
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    throw new Error('Имя проекта может содержать только строчные буквы, цифры и дефисы');
  }
}

export const validateNodeVersion = () => {
  const current = process.versions.node.split('.')[0];
  if (current < 18) throw new Error('Требуется Node.js v18+');
};
