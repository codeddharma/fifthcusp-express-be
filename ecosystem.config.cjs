module.exports = {
  apps: [
    {
      name: 'fifthcusp-api',
      cwd: __dirname,
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork', // node-cron jobs must NOT run in multiple copies
      env: { NODE_ENV: 'production' },
      max_memory_restart: '500M',
      time: true,
    },
  ],
}
