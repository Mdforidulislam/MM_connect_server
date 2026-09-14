module.exports = {
  apps: [
    {
      name: "mmengserv",
      script: "dist/main.js",
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};

