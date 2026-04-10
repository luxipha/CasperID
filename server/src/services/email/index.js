/**
 * Email Module Index
 * Exports all email-related components
 */

const EmailManager = require('./EmailManager');
const BaseEmailProvider = require('./BaseEmailProvider');
const SmtpProvider = require('./SmtpProvider');
const LoopsProvider = require('./LoopsProvider');

module.exports = {
    EmailManager,
    BaseEmailProvider,
    SmtpProvider,
    LoopsProvider
};
