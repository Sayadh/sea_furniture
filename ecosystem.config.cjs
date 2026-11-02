/**
 * PM2 process file.
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'sea-api',
      cwd: './backend',
      script: 'dist/main.js',
      // NestJS ConfigModule reads backend/.env itself
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production' },
      out_file: '../logs/api.out.log',
      error_file: '../logs/api.err.log',
      time: true,
    },
    {
      name: 'sea-web',
      cwd: './frontend',
      script: '.output/server/index.mjs',
      // Nuxt production build does not load .env on its own
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production' },
      out_file: '../logs/web.out.log',
      error_file: '../logs/web.err.log',
      time: true,
    },
  ],
};
