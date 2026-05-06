module.exports = {
  apps: [
    {
      name: "aiprint-web",
      script: ".next/standalone/server.js",
      cwd: "/www/wwwroot/aiprint.hichara.com",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "127.0.0.1",
        PORT: 3000,
      },
      instances: 1,
      max_memory_restart: "512M",
      error_file: "/www/wwwroot/aiprint.hichara.com/logs/pm2-error.log",
      out_file: "/www/wwwroot/aiprint.hichara.com/logs/pm2-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
