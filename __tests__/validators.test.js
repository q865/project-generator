import { validateProjectName } from '../lib/utils/validators.js';

describe('Валидация имени проекта', () => {
  test('Корректное имя проходит валидацию', () => {
    expect(() => validateProjectName('my-project')).not.toThrow();
  });

  test('Пустое имя вызывает ошибку', () => {
    expect(() => validateProjectName('')).toThrow();
  });

  test('Имя с заглавными буквами вызывает ошибку', () => {
    expect(() => validateProjectName('MyProject')).toThrow();
  });
});
