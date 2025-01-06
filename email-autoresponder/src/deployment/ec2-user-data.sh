#!/bin/bash

# Update system packages
yum update -y
yum install -y gcc-c++ make
yum install -y git

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Create app directory
mkdir -p /var/www/email-autoresponder
cd /var/www/email-autoresponder

# Configure firewall
yum install -y iptables-services
systemctl start iptables
systemctl enable iptables
iptables -I INPUT -p tcp --dport 80 -j ACCEPT
iptables -I INPUT -p tcp --dport 443 -j ACCEPT
service iptables save

# Install and configure Nginx
yum install -y nginx
systemctl start nginx
systemctl enable nginx

# Configure Nginx as reverse proxy
cat > /etc/nginx/conf.d/email-autoresponder.conf << 'EOL'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOL

# Restart Nginx
systemctl restart nginx

# Set up SSL with Let's Encrypt
yum install -y epel-release
yum install -y certbot python2-certbot-nginx

# Install CloudWatch agent for monitoring
yum install -y amazon-cloudwatch-agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:AmazonCloudWatch-Config

# Set up log rotation
cat > /etc/logrotate.d/email-autoresponder << 'EOL'
/var/www/email-autoresponder/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 nodejs nodejs
}
EOL
