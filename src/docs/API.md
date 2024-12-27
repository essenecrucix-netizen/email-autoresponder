# API Documentation

## Table of Contents
- [AI Agent Module](#ai-agent-module)
- [Email Processor Module](#email-processor-module)
- [Language Detector Module](#language-detector-module)
- [Escalation Manager Module](#escalation-manager-module)
- [Database Service Module](#database-service-module)

## AI Agent Module

### `generateResponse(emailContent: string, knowledgeBase: Array): Promise<string>`
Generates an AI response based on email content and knowledge base.

**Parameters:**
- `emailContent`: The content of the email to respond to
- `knowledgeBase`: Array of knowledge base articles

**Returns:**
- Promise resolving to the generated response string

**Example:**
javascript
const response = await aiAgent.generateResponse(
    "How do I reset my password?",
    [{ content: "Password reset instructions..." }]
);


### `analyzeEmailSentiment(emailContent: string): Promise<string>`
Analyzes the sentiment of an email.

**Parameters:**
- `emailContent`: The content to analyze

**Returns:**
- Promise resolving to 'positive', 'negative', or 'neutral'

### `shouldEscalate(emailContent: string): Promise<boolean>`
Determines if an email needs human escalation.

**Parameters:**
- `emailContent`: The content to analyze

**Returns:**
- Promise resolving to true/false

## Email Processor Module

### `processNewEmail(email: EmailObject): Promise<TrickleObject>`
Processes a new incoming email.

**Parameters:**
- `email`: Object containing email details
  - `subject`: Email subject
  - `content`: Email content
  - `sender`: Sender's email address

**Returns:**
- Promise resolving to the processed email object

### `getRelevantKnowledgeBase(content: string): Promise<Array>`
Retrieves relevant knowledge base articles.

**Parameters:**
- `content`: Query content to match against knowledge base

**Returns:**
- Promise resolving to array of relevant articles

## Language Detector Module

### `detectLanguage(text: string): Promise<string>`
Detects the language of input text.

**Parameters:**
- `text`: Text to analyze

**Returns:**
- Promise resolving to ISO 639-1 language code

### `translateResponse(text: string, targetLanguage: string): Promise<string>`
Translates text to target language.

**Parameters:**
- `text`: Text to translate
- `targetLanguage`: Target language code

**Returns:**
- Promise resolving to translated text

## Escalation Manager Module

### `processEscalation(email: EmailObject): Promise<TrickleObject>`
Processes an email escalation.

**Parameters:**
- `email`: Email object to escalate

**Returns:**
- Promise resolving to escalation record

### `assignEscalation(escalationId: string, adminId: string): Promise<void>`
Assigns an escalation to an admin.

**Parameters:**
- `escalationId`: ID of escalation
- `adminId`: ID of admin to assign

## Database Service Module

### `createItem(tableName: string, item: Object): Promise<TrickleObject>`
Creates a new item in the database.

**Parameters:**
- `tableName`: Name of the table
- `item`: Object to store

**Returns:**
- Promise resolving to created item

### `queryItems(tableName: string, indexName: string, conditions: Object): Promise<Array>`
Queries items from the database.

**Parameters:**
- `tableName`: Name of the table
- `indexName`: Name of the index to query
- `conditions`: Query conditions

**Returns:**
- Promise resolving to array of matching items

## Error Handling

All API methods include error handling using try-catch blocks and the `reportError` function. Errors are propagated with meaningful messages and appropriate status codes.

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Standard users: 100 requests per minute
- Premium users: 1000 requests per minute

## Authentication

API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

http
Authorization: Bearer <your-jwt-token>


## Response Format

All API responses follow this format:

json
{
    "success": boolean,
    "data": Object | Array | null,
    "error": string | null
}
