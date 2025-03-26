import chalk from 'chalk';

export function validateProjectName(name) {
  if (!name) {
    throw new Error('Имя проекта не может быть пустым');
  }

  if (!/^[a-z0-9-]+$/.test(name)) {
    throw new Error('Имя проекта может содержать только строчные буквы, цифры и дефисы');
  }
}
