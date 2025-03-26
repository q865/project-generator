import { existsSync } from 'fs';
import { join } from 'path';
import { describe, test } from 'jest';

describe('Проверка шаблонов', () => {
  const templatesDir = join(process.cwd(), 'lib', 'templates');

  test('Шаблон React существует', () => {
    expect(existsSync(join(templatesDir, 'react'))).toBeTruthy();
    expect(existsSync(join(templatesDir, 'react', 'vite.config.js'))).toBeTruthy();
  });
});
