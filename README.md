# Email Autoresponder

An intelligent email automation system that helps manage and respond to emails automatically using modern web technologies and cloud services. The system uses OpenAI's GPT model to generate human-like responses while maintaining a consistent personality and tone.

## 🚀 Features

- Automated email response handling with AI-powered responses
- Intelligent email classification and prioritization
- Sentiment analysis for incoming emails
- Multi-language support with automatic language detection
- Support for multiple email formats (PDF, Word documents)
- Thread history awareness for contextual responses
- Secure authentication and authorization
- AWS S3 integration for file storage
- DynamoDB for data persistence
- Google APIs integration for email handling
- Modern React frontend with Tailwind CSS
- Express.js backend API
- Multiple OpenAI API key support with automatic rotation

## 🤖 AI Capabilities

### Email Classification
- Automatically classifies incoming emails into categories:
  - Help requests
  - Information requests
  - Complaints
  - Spam
- Uses specific criteria to determine if an email requires a response
- Prioritizes emails based on sentiment and urgency

### Sentiment Analysis
- Analyzes the emotional tone of incoming emails
- Categorizes emails as positive, negative, or neutral
- Prioritizes negative sentiment emails for faster response
- Helps in determining escalation needs

### Response Generation
- Maintains a consistent, friendly CEO personality
- Contextual awareness of company information and previous conversations
- Structured response format with:
  - Casual, personal greetings
  - Clear, conversational explanations
  - Appropriate escalation handling
  - Consistent signature format
- Support for knowledge base integration
- Thread history awareness for contextual responses

### Thread Management
The system maintains context across email conversations through sophisticated thread handling:

#### Thread History Awareness
- Automatically tracks and maintains email conversation history
- Links related emails using message IDs and references
- Preserves context across multiple exchanges
- Understands and references previous interactions

#### Contextual Response Benefits
- Avoids repeating information already discussed
- References previous solutions or suggestions
- Maintains conversation continuity
- Provides more personalized and relevant responses
- Acknowledges and builds upon previous interactions

#### Implementation Details
The thread management is handled through several components:

1. Database Storage:
   ```javascript
   // Messages are stored with thread relationships
   {
     messageId: "unique_id",
     threadId: "thread_identifier",
     inReplyTo: "parent_message_id",
     timestamp: "2024-01-01T00:00:00Z",
     content: "Message content"
   }
   ```

2. Thread History Integration:
   - The `EmailService` automatically retrieves related messages
   - Thread history is passed to the AI for context
   - Responses are generated with awareness of previous exchanges

3. Context Window:
   - System maintains a rolling window of previous messages
   - Most recent and relevant exchanges are prioritized
   - Ensures responses remain coherent within long-running threads

#### Example Usage
When responding to a follow-up email, the system:
1. Identifies the thread using email headers
2. Retrieves previous exchanges
3. Includes relevant context in the AI prompt
4. Generates a response that acknowledges and builds upon the conversation history

This ensures that each response is part of a coherent conversation rather than isolated replies.

#### Customizing Thread Handling
You can adjust thread handling behavior in `src/services/email/EmailService.js`:
```javascript
// Configure thread history depth
const THREAD_HISTORY_LIMIT = 5; // Number of previous messages to include

// Adjust thread matching criteria
const threadMatching = {
  useSubject: true,    // Match by subject
  useReferences: true, // Use email reference headers
  useTimeWindow: true  // Consider messages within time window
};
```

#### Customizing Response Personality
You can customize the AI's personality and response style by modifying the `CONTEXT` object in `src/services/ai/OpenAIService.js`:

```javascript
const CONTEXT = {
    industry: process.env.INDUSTRY_CONTEXT || "your_industry",
    role: process.env.ROLE_CONTEXT || "your_role",
    companyContext: `As the [role] of a [industry] company, we specialize in:
    - Your company's key features
    - Your main services
    - Any specific areas of expertise`
};
```

The system prompt that defines the AI's personality can be modified in the `generateResponse` function. Look for the `systemPrompt` variable to adjust:
- Communication style
- Response structure
- Escalation rules
- Signature format
- Company-specific information

### Language Processing
- Automatic language detection
- Support for multiple languages
- ISO 639-1 language code identification

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- AWS Account with appropriate credentials
- Google Cloud Platform account for Gmail API
- OpenAI API key(s)
- Environment variables configured (see Configuration section)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/essenecrucix-netizen/email-autoresponder.git
cd email_autoresponder
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Fill in required environment variables

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region

# Google API Configuration
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_KEYS=key1,key2,key3 # Optional: Multiple API keys for rotation

# Email Configuration
EMAIL_USER=your_email
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_TLS=true
ESCALATION_EMAIL=escalation@yourdomain.com

# App Configuration
JWT_SECRET=your_jwt_secret
PORT=3000
INDUSTRY_CONTEXT=fleet management software
ROLE_CONTEXT=CEO
```

## 🚀 Usage

1. Start the development server:
```bash
# Start backend server
npm start

# Start frontend development server (in a separate terminal)
cd frontend
npm start
```

2. Build for production:
```bash
# Build frontend
cd frontend
npm run build

# Start production server
npm start
```

## 🏗️ Project Structure

```
email_autoresponder/
├── src/                    # Backend source code
│   ├── components/         # Reusable components
│   ├── config/            # Configuration files
│   ├── services/          # Business logic services
│   │   ├── ai/           # AI-related services
│   │   ├── email/        # Email processing services
│   │   └── database/     # Database services
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── frontend/              # Frontend React application
├── tests/                 # Test files
└── docs/                  # Documentation
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🔒 Security

- JWT authentication for API endpoints
- Secure file handling
- Environment variable protection
- AWS IAM roles and policies
- Input validation and sanitization
- API key rotation for OpenAI
- Secure email handling with OAuth 2.0

## 🔒 Security Notice

### Credential Management
- NEVER commit sensitive credentials to the repository
- Always use environment variables for sensitive information
- Copy `ecosystem.config.example.js` to `ecosystem.config.js` and fill in your credentials
- Add all credential files to `.gitignore`

### Required Credentials
1. AWS Credentials:
   - Create an IAM user with minimal required permissions
   - Enable MFA for the IAM user
   - Store credentials in environment variables or AWS credentials file
   - Regularly rotate access keys

2. Google API Credentials:
   - Create a new project in Google Cloud Console
   - Enable required APIs (Gmail, etc.)
   - Create OAuth 2.0 credentials
   - Store credentials securely
   - Use refresh tokens instead of access tokens

3. OpenAI API Keys:
   - Generate API keys from OpenAI dashboard
   - Use multiple keys for rotation
   - Monitor usage and set rate limits

### Security Best Practices
1. Environment Variables:
   ```bash
   # Local Development
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. Production Deployment:
   - Use a secure secrets management service
   - Enable encryption at rest
   - Implement proper access controls
   - Monitor for unauthorized access

3. Access Management:
   - Implement the principle of least privilege
   - Regularly audit access permissions
   - Monitor and log all API usage
   - Set up alerts for suspicious activity

### Credential Rotation
Implement regular credential rotation:
- AWS Access Keys: Every 90 days
- API Keys: Every 60 days
- OAuth Refresh Tokens: As needed
- Monitor for unauthorized access

## 📦 Dependencies

### Backend
- express
- @aws-sdk/client-s3
- @aws-sdk/client-dynamodb
- googleapis
- nodemailer
- imap
- mailparser
- openai
- bcrypt
- jsonwebtoken
- and more...

### Frontend
- react
- tailwindcss
- and other UI dependencies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author

- Erik Brisson - Initial work

## 🙏 Acknowledgments

- AWS SDK team
- Google Cloud Platform
- OpenAI team
- Open source community

## 📧 Email Setup Guide

### Gmail Configuration
1. Enable IMAP in Gmail:
   - Go to Gmail Settings > 'Forwarding and POP/IMAP'
   - Enable IMAP access
   - Save changes

2. Create Google Cloud Project:
   - Visit Google Cloud Console
   - Create a new project
   - Enable Gmail API
   - Configure OAuth 2.0 credentials
   - Add authorized redirect URIs

3. Setup App Password (if using 2FA):
   - Go to Google Account settings
   - Security > 2-Step Verification
   - App passwords > Create new app password
   - Use this password in your .env file

### OAuth 2.0 Setup
1. Create credentials in Google Cloud Console:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=your_redirect_uri
   ```

2. Generate refresh token:
   - Run the provided script:
   ```bash
   node src/utils/generateToken.js
   ```
   - Follow the authorization flow
   - Save the refresh token in your .env file

### Email Configuration
1. Update .env with email settings:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_HOST=imap.gmail.com
   EMAIL_PORT=993
   EMAIL_TLS=true
   ESCALATION_EMAIL=your_escalation@email.com
   ```

2. Configure email processing rules:
   - Modify `src/services/email/EmailService.js` for custom email handling
   - Adjust email classification criteria in `classifyEmail` function
   - Set up custom email filters and priority rules

### Knowledge Base Integration
1. Create a knowledge base directory:
   ```bash
   mkdir src/knowledge_base
   ```

2. Add your knowledge base files:
   - Create markdown files with company information
   - Add product documentation
   - Include common response templates

3. Update knowledge base integration:
   - Modify `src/services/ai/OpenAIService.js` to include your knowledge base
   - Adjust the context integration in `generateResponse` function

### Escalation Setup
1. Configure escalation rules in `src/services/email/EmailService.js`
2. Set up escalation email notifications:
   ```env
   ESCALATION_EMAIL=support@yourdomain.com
   ESCALATION_CC=manager@yourdomain.com
   ```
3. Customize escalation criteria in the email classification system

### Rate Limiting and API Keys
1. Configure OpenAI API key rotation:
   ```env
   OPENAI_API_KEYS=key1,key2,key3
   ```
2. Adjust rate limiting in `src/services/ai/OpenAIService.js`:
   ```javascript
   const API_CONFIG = {
       model: 'your_preferred_model',
       baseUrl: 'https://api.openai.com/v1',
       maxTokens: 500,
       temperature: 0.7
   };
   ``` 