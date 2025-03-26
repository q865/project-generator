const path = require('path');

const templateConfigs = {
  react: {
    dir: 'react',
    dependencies: ['react', 'react-dom'],
    devDependencies: ['vite', '@vitejs/plugin-react'],
  },
  nextjs: {
    dir: 'nextjs',
    dependencies: ['next'],
    devDependencies: [],
  },
  express: {
    dir: 'express',
    dependencies: ['express'],
    devDependencies: ['nodemon'],
  },
  vanilla: {
    dir: 'vanilla',
    dependencies: [],
    devDependencies: [],
  },
};

const getTemplateConfig = (templateName) => {
  const config = templateConfigs[templateName];
  return {
    ...config,
    templatePath: path.join(__dirname, '../templates', config.dir),
  };
};

module.exports = {
  defaultFiles: ['.gitignore', 'README.md'],
  templateConfig: {
    react: {
      dir: 'react',
      dependencies: ['react', 'react-dom'],
      devDependencies: ['vite', '@vitejs/plugin-react'],
    },
    // ... другие шаблоны
    getTemplateConfig,
    templateConfigs,
  },
};
