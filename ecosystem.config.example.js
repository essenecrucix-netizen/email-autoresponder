module.exports = {
  apps: [{
    name: 'email-monitor',
    script: 'src/emailMonitor.js',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 5000,
    env: {
      NODE_ENV: 'production',
      EMAIL_USER: 'your.email@yourdomain.com',
      EMAIL_HOST: 'imap.gmail.com',
      EMAIL_PORT: '993',
      EMAIL_TLS: 'true',
      AWS_ACCESS_KEY_ID: 'your_aws_access_key_id',
      AWS_SECRET_ACCESS_KEY: 'your_aws_secret_access_key',
      AWS_REGION: 'your_aws_region',
      S3_BUCKET_NAME: 'your_s3_bucket_name',
      USER_ID: 'your_user_id',
      GOOGLE_CLIENT_ID: 'your_google_client_id',
      GOOGLE_CLIENT_SECRET: 'your_google_client_secret',
      GOOGLE_REFRESH_TOKEN: 'your_google_refresh_token',
      ESCALATION_EMAIL: 'escalation@yourdomain.com',
      INDUSTRY_CONTEXT: 'your_industry',
      ROLE_CONTEXT: 'your_role',
      OPENAI_API_KEYS: 'your_openai_api_key1,your_openai_api_key2'
    },
    error_file: 'logs/email-monitor-error.log',
    out_file: 'logs/email-monitor-out.log',
    time: true
  }]
}; 