module.exports = {
  defaultFiles: ['.gitignore', 'README.md'],
  templateConfig: {
    react: {
      dir: 'react',
      dependencies: ['react', 'react-dom'],
      devDependencies: ['vite', '@vitejs/plugin-react'],
    },
    // ... другие шаблоны
  },
};
