{
  "name": "<%= projectName %>",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    <%_ if (jest) { _%>
    "test": "jest"
    <%_ } _%>
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
    <%_ if (typescript) { _%>
    ,"typescript": "^5.3.0"
    <%_ } _%>
    <%_ if (jest) { _%>
    ,"jest": "^29.7.0"
    <%_ } _%>
  }
}
