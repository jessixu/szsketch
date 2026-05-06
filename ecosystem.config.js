module.exports = {
  apps: [
    {
      name: "szsketch",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/var/www/szsketch",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      max_memory_restart: "512M",
      error_file: "/var/log/szsketch/error.log",
      out_file: "/var/log/szsketch/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
