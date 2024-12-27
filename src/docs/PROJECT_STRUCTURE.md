# Project Structure

## Directory Tree

email-autoresponder/
├── components/
│   ├── analytics/
│   │   └── AnalyticsCharts.js       # Analytics visualization component
│   ├── auth/
│   │   ├── AuthGuard.js            # Authentication protection component
│   │   ├── LoginForm.js            # User login form
│   │   └── SignupForm.js           # User registration form
│   ├── EmailList.js                # Email list and management component
│   ├── Header.js                   # Application header component
│   ├── KnowledgeBase.js            # Knowledge base management component
│   └── Sidebar.js                  # Navigation sidebar component
│
├── services/
│   ├── ai/
│   │   └── OpenAIService.js        # OpenAI integration service
│   ├── database/
│   │   └── DatabaseService.js      # Database abstraction layer
│   └── email/
│       └── EmailService.js         # Email processing service
│
├── utils/
│   ├── aiAgent.js                  # AI processing utilities
│   ├── auth.js                     # Authentication utilities
│   ├── emailProcessor.js           # Email processing utilities
│   ├── escalationManager.js        # Escalation handling utilities
│   ├── filePreview.js             # File preview utilities
│   └── languageDetector.js         # Language detection utilities
│
├── styles/
│   ├── main.css                    # Global styles
│   └── dashboard.css               # Dashboard-specific styles
│
├── tests/
│   ├── setup.js                    # Test configuration
│   └── utils/
│       ├── aiAgent.test.js         # AI agent tests
│       └── emailProcessor.test.js   # Email processor tests
│
├── deployment/
│   ├── aws-setup.sh               # AWS infrastructure setup script
│   └── ec2-user-data.sh           # EC2 instance initialization script
│
├── docs/
│   ├── API.md                      # API documentation
│   ├── ARCHITECTURE.md             # System architecture documentation
│   ├── PROJECT_STRUCTURE.md        # This file
│   └── SETUP.md                    # Setup and deployment guide
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deployment workflow
│
├── app.js                          # Main application entry point
├── index.html                      # HTML entry point
├── jest.config.js                  # Jest testing configuration
├── package.json                    # Project dependencies and scripts
└── README.md                       # Project overview and documentation


## Key Directories and Files

### `/components`
Frontend React components organized by feature:
- `analytics/`: Data visualization components
- `auth/`: Authentication-related components
- Root components for core functionality

### `/services`
Backend service integrations:
- `ai/`: AI service integrations (OpenAI)
- `database/`: Database access layer
- `email/`: Email processing services

### `/utils`
Utility functions and helpers:
- `aiAgent.js`: AI processing logic
- `auth.js`: Authentication utilities
- `emailProcessor.js`: Email handling logic
- `escalationManager.js`: Escalation workflows
- `languageDetector.js`: Language detection utilities

### `/styles`
CSS stylesheets:
- `main.css`: Global styles
- `dashboard.css`: Dashboard-specific styles

### `/tests`
Test files and configuration:
- `setup.js`: Test environment setup
- Unit tests for utilities and components

### `/deployment`
Deployment and infrastructure scripts:
- `aws-setup.sh`: AWS infrastructure setup
- `ec2-user-data.sh`: EC2 instance configuration

### `/docs`
Project documentation:
- `API.md`: API documentation
- `ARCHITECTURE.md`: System architecture
- `SETUP.md`: Setup instructions
- `PROJECT_STRUCTURE.md`: Project structure (this file)

## File Naming Conventions

1. **Components**
   - PascalCase for component files: `Header.js`, `EmailList.js`
   - Each component in its own file
   - Feature-specific components in subdirectories

2. **Utilities**
   - camelCase for utility files: `aiAgent.js`, `emailProcessor.js`
   - Focused, single-responsibility modules

3. **Tests**
   - Match source file name with `.test.js` suffix
   - Maintain parallel directory structure with source

4. **Styles**
   - camelCase for CSS files
   - Feature-specific styles in separate files

## Code Organization

### Components
javascript
// Example component structure
function ComponentName() {
    // State declarations
    // Hook definitions
    // Helper functions
    // Render logic
}


### Services
javascript
// Example service structure
function ServiceName() {
    // Configuration
    // Public methods
    // Private helper methods
    // Return public API
}


### Utilities
javascript
// Example utility structure
function UtilityName() {
    // Utility functions
    // Helper methods
    // Return public methods
}


## Best Practices

1. **File Organization**
   - Group related files together
   - Keep files focused and small
   - Use clear, descriptive names

2. **Component Structure**
   - One component per file
   - Group related components in directories
   - Keep components focused

3. **Testing**
   - Maintain test file structure
   - Group related tests
   - Follow naming conventions

4. **Documentation**
   - Keep documentation up-to-date
   - Document key decisions
   - Include setup instructions

## Module Dependencies


app.js
  ├── components/*
  │   └── utils/*
  ├── services/*
  │   └── utils/*
  └── utils/*
      └── services/*


## Build and Deploy Structure


Source Files → Build Process → Distribution
    │             │              │
    │             │              └── Deployed to AWS
    │             └── Testing
    └── Development


## Version Control


main
  └── feature branches
      └── development
          └── local branches


This structure promotes:
- Modularity
- Scalability
- Maintainability
- Clear separation of concerns
- Easy testing and deployment
