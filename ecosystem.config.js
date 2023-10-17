module.exports = {
  apps: [{
    name: 'Safar Central API - 1',
    script: 'src/server.js',
    args: 'EXPRESS REST API - 1',
    instances: 'max',
    autorestart: true,
    watch: false,
    exec_mode : "cluster",
    max_memory_restart: '1G',
   
  }]
};

