{
    "name": "email-autoresponder",
    "version": "1.0.0",
    "description": "An AI-powered email autoresponder application.",
    "main": "server.js",
    "scripts": {
      "start": "node server.js",
      "build": "react-scripts build",
      "frontend-start": "react-scripts start",
      "backend-start": "node server.js",
      "test": "jest" // Added script to run Jest tests
    },
    "author": "Your Name",
    "license": "MIT",
    "dependencies": {
      "dotenv": "^16.0.3",
      "express": "^4.18.2",
      "mailparser": "^3.6.0",
      "nodemailer": "^6.9.2",
      "pm2": "^5.3.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-scripts": "5.0.1"
    },
    "devDependencies": {
      "@babel/core": "^7.20.5",
      "@babel/plugin-proposal-private-property-in-object": "^7.21.11",
      "@babel/preset-react": "^7.18.6",
      "jest": "^29.0.0" // Added Jest as a devDependency
    },
    "browserslist": {
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    }
  }
  