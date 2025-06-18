module.exports = {
  apps: [
    {
      name: 'bitcoin-tracker',
      exec_mode: 'cluster',
      instances: 'max',
      script: '.output/server/index.mjs',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0'
      }
    }
  ]
}
