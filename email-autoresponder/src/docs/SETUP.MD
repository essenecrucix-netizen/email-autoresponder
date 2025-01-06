# Setup Guide

## Prerequisites

1. AWS Account with appropriate permissions
2. Node.js 16.x or later
3. AWS CLI installed and configured
4. Git installed
5. Domain name (optional, for SSL/HTTPS)

## Installation Steps

### 1. Clone Repository

bash
git clone https://github.com/your-org/email-autoresponder.git
cd email-autoresponder


### 2. Configure Environment Variables

Create a `.env` file:

env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password

# Slack Configuration
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Application Configuration
NODE_ENV=production
PORT=3000


### 3. AWS Infrastructure Setup

Run the deployment script:

bash
chmod +x deployment/aws-setup.sh
./deployment/aws-setup.sh production


This script will:
- Create VPC and networking components
- Launch EC2 instances
- Configure security groups
- Set up DynamoDB tables

### 4. SSL Certificate Setup

If using a domain:

bash
# Install certbot
sudo yum install -y certbot python2-certbot-nginx

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com


### 5. Database Initialization

bash
# Create DynamoDB tables
aws dynamodb create-table \
    --table-name emails \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

aws dynamodb create-table \
    --table-name users \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5


### 6. Application Deployment

bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the application
pm2 start npm --name "email-autoresponder" -- start


### 7. Nginx Configuration

Create Nginx configuration:

nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}


### 8. Monitoring Setup

bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard


### 9. Security Configuration

bash
# Configure firewall
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo service iptables save

# Set up AWS WAF (optional)
aws wafv2 create-web-acl \
    --name email-autoresponder-waf \
    --scope REGIONAL \
    --default-action Block={} \
    --rules file://waf-rules.json


## Verification Steps

1. Check Application Status:
bash
pm2 status


2. Verify Nginx:
bash
sudo nginx -t
curl http://localhost


3. Test SSL (if configured):
bash
curl https://yourdomain.com


4. Monitor Logs:
bash
pm2 logs email-autoresponder


## Troubleshooting

### Common Issues

1. **Connection Refused**
bash
# Check if service is running
pm2 list

# Check application logs
pm2 logs email-autoresponder


2. **Database Connection Issues**
bash
# Verify AWS credentials
aws sts get-caller-identity

# Check DynamoDB tables
aws dynamodb list-tables


3. **Email Service Issues**
bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check email logs
tail -f /var/log/maillog


### Maintenance

1. **Backup Database**
bash
aws dynamodb create-backup \
    --table-name emails \
    --backup-name emails-backup-$(date +%Y%m%d)


2. **Update SSL Certificate**
bash
sudo certbot renew


3. **Rotate Logs**
bash
pm2 flush


## Security Best Practices

1. **Regular Updates**
bash
# Update system packages
sudo yum update -y

# Update npm packages
npm audit fix


2. **Backup Configuration**
bash
# Backup environment variables
cp .env .env.backup

# Backup Nginx configuration
sudo cp /etc/nginx/conf.d/email-autoresponder.conf /etc/nginx/conf.d/email-autoresponder.conf.backup


3. **Monitor Security Groups**
bash
aws ec2 describe-security-groups


## Performance Optimization

1. **Enable Nginx Caching**
2. **Configure PM2 Cluster Mode**
3. **Set Up CloudFront Distribution**

## Scaling Considerations

1. **Horizontal Scaling**
   - Configure Auto Scaling Groups
   - Set up Application Load Balancer

2. **Database Scaling**
   - Monitor DynamoDB capacity
   - Consider on-demand scaling

3. **CDN Integration**
   - Set up CloudFront distribution
   - Configure origin settings
