Comprehensive Setup Guide
1. Prerequisites

Ensure you have the following tools and accounts set up before proceeding:

    GitHub Account
    AWS Account with sufficient permissions to create EC2 instances, DynamoDB tables, and other resources.
    Node.js (v16.x or later) installed.
    AWS CLI installed and configured.
    Git installed.
    Domain Name (optional, for HTTPS/SSL setup).
    PM2 installed globally:
	
	npm install pm2 -g

2. Create and Upload Project to GitHub
	
	Step 1: Create a GitHub Repository

		1 Log in to GitHub.
		2 Create a new repository called email-autoresponder.
		3 Leave it public or private depending on your preference.

	Step 2: Clone and Upload Files

		1. Clone the repository to your local system:

			git clone https://github.com/your-username/email-autoresponder.git
			cd email-autoresponder

		2 Copy all application files and folders into the repository.
		3 Add the files to Git:

			git add .
			git commit -m "Initial commit"
			git push origin main
			
3. AWS Infrastructure Setup

	Step 1: Launch an EC2 Instance

		1 Log in to the AWS Management Console.
		2 Navigate to EC2 > Instances > Launch Instance.
		3 Configure the instance:
			AMI: Amazon Linux 2.
			Instance Type: t2.micro (Free Tier eligible).
			Key Pair: Select or create a key pair for SSH access.
			Security Group: Open ports 22 (SSH), 80 (HTTP), and 443 (HTTPS).
		4 Launch the instance.

	Step 2: Connect to the Instance

		SSH into the EC2 instance:

		ssh -i /path/to/key.pem ec2-user@<ec2-public-ip>

	Step 3: Install Required Packages

		Run the following commands on the EC2 instance:

			sudo yum update -y
			sudo yum install git -y
			curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
			sudo yum install nodejs -y
			
4. Clone Repository on EC2

    1 Clone the GitHub repository:

		git clone https://github.com/your-username/email-autoresponder.git
		cd email-autoresponder

	2 Install dependencies:

		npm install

5. Configure Environment Variables

    1 Create a .env file in the project directory:

		nano .env

	2 Add the following content to the file:

		# OpenAI API Keys
		OPENAI_API_KEYS=key1,key2,key3

		# Email Configuration
		EMAIL_USER=your_email@example.com
		EMAIL_PASSWORD=secure_password
		EMAIL_HOST=imap.example.com
		EMAIL_PORT=993
		EMAIL_TLS=true

		# Escalation Workflow
		ESCALATION_EMAIL=escalation@example.com

		# Industry/Role Context
		INDUSTRY_CONTEXT=systems integration
		ROLE_CONTEXT=CEO

	3 Save and exit (CTRL+O, CTRL+X).
	
6. Set Up DynamoDB

    1 Create the required DynamoDB tables:

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

7. Run the Application

    1 Start the application using PM2:

		pm2 start npm --name "email-autoresponder" -- start

	2 Check the application status:

		pm2 status
		
8. Nginx Configuration (Optional for HTTPS)

    1 Install Nginx:

		sudo yum install nginx -y
		sudo systemctl start nginx
		sudo systemctl enable nginx

	2 Configure Nginx:

		sudo nano /etc/nginx/conf.d/email-autoresponder.conf

	3 Add the following configuration:

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

	4 Restart Nginx:

		sudo nginx -t
		sudo systemctl restart nginx
		
9. Set Up Monitoring

    1 Install the CloudWatch Agent:

		wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
		sudo rpm -U ./amazon-cloudwatch-agent.rpm

	2 Configure the agent:

		sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
		
10. Verify Deployment

    1 Access the application at:
        http://<ec2-public-ip> (without domain).
        http://yourdomain.com (if domain configured).
		
    2 Monitor logs:

		pm2 logs email-autoresponder
		
11. Maintenance and Troubleshooting

    1 Rotate Logs:

		pm2 flush

	2 Renew SSL Certificate:

		sudo certbot renew

	3 Backup Database:

		aws dynamodb create-backup --table-name emails --backup-name emails-backup-$(date +%Y%m%d)
		
Notes

    Ensure security groups allow necessary traffic (HTTP/HTTPS).
    Regularly update your dependencies and server packages.