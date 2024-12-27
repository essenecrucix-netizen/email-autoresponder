function EscalationManager() {
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
    const database = DatabaseService();

    async function processEscalation(email) {
        try {
            // Create escalation record
            const escalation = await database.createItem('escalations', {
                emailId: email.objectId,
                status: 'pending',
                priority: calculatePriority(email),
                assignedTo: null,
                createdAt: new Date().toISOString()
            });

            // Notify relevant parties
            await Promise.all([
                notifyAdminsByEmail(email, escalation),
                notifySlackChannel(email, escalation)
            ]);

            // Update email status
            await database.updateItem('emails', email.objectId, {
                status: 'escalated',
                escalationId: escalation.objectId
            });

            return escalation;
        } catch (error) {
            reportError(error);
            throw new Error('Failed to process escalation');
        }
    }

    function calculatePriority(email) {
        try {
            const priorityFactors = {
                sentiment: email.objectData.sentiment === 'negative' ? 2 : 1,
                urgent: /urgent|asap|emergency/i.test(email.objectData.subject) ? 2 : 1,
                repeat: email.objectData.previousEmails > 2 ? 2 : 1
            };

            const priorityScore = Object.values(priorityFactors).reduce((a, b) => a * b, 1);
            
            if (priorityScore >= 6) return 'high';
            if (priorityScore >= 3) return 'medium';
            return 'low';
        } catch (error) {
            reportError(error);
            return 'medium'; // Default to medium priority on error
        }
    }

    async function notifyAdminsByEmail(email, escalation) {
        try {
            const emailService = EmailService();
            const adminEmails = await getAdminEmails();
            
            const emailContent = `
                Urgent: New Escalated Email
                
                Email Details:
                - Subject: ${email.objectData.subject}
                - From: ${email.objectData.sender}
                - Priority: ${escalation.objectData.priority}
                - Escalation ID: ${escalation.objectId}
                
                Original Content:
                ${email.objectData.content}
                
                Please access the dashboard to handle this escalation.
            `;

            await Promise.all(
                adminEmails.map(adminEmail =>
                    emailService.sendReply(adminEmail, 'Email Escalation Alert', emailContent)
                )
            );
        } catch (error) {
            reportError(error);
        }
    }

    async function notifySlackChannel(email, escalation) {
        try {
            const message = {
                text: '🚨 New Email Escalation',
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '🚨 New Email Escalation'
                        }
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Subject:*\n${email.objectData.subject}`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Priority:*\n${escalation.objectData.priority}`
                            }
                        ]
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Content:*\n${email.objectData.content.substring(0, 200)}...`
                        }
                    },
                    {
                        type: 'actions',
                        elements: [
                            {
                                type: 'button',
                                text: {
                                    type: 'plain_text',
                                    text: 'View in Dashboard'
                                },
                                url: `${process.env.DASHBOARD_URL}/escalations/${escalation.objectId}`
                            }
                        ]
                    }
                ]
            };

            const response = await fetch(SLACK_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                throw new Error(`Slack notification failed: ${response.status} ${await response.text()}`);
            }
        } catch (error) {
            reportError(error);
        }
    }

    async function getAdminEmails() {
        try {
            const users = await database.queryItems('users', 'role-index', {
                expression: '#role = :role',
                names: { '#role': 'role' },
                values: { ':role': 'admin' }
            });
            return users.map(user => user.objectData.email);
        } catch (error) {
            reportError(error);
            return [];
        }
    }

    async function assignEscalation(escalationId, adminId) {
        try {
            await database.updateItem('escalations', escalationId, {
                assignedTo: adminId,
                status: 'assigned',
                assignedAt: new Date().toISOString()
            });
        } catch (error) {
            reportError(error);
            throw new Error('Failed to assign escalation');
        }
    }

    async function resolveEscalation(escalationId, resolution) {
        try {
            await database.updateItem('escalations', escalationId, {
                status: 'resolved',
                resolution,
                resolvedAt: new Date().toISOString()
            });

            const escalation = await database.getItem('escalations', escalationId);
            await database.updateItem('emails', escalation.objectData.emailId, {
                status: 'resolved'
            });
        } catch (error) {
            reportError(error);
            throw new Error('Failed to resolve escalation');
        }
    }

    return {
        processEscalation,
        assignEscalation,
        resolveEscalation
    };
}
