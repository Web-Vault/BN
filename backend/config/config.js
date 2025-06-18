import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

// Twilio configuration
const twilioConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
};

// Initialize Twilio client
const twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);

// Validate Twilio configuration
const validateTwilioConfig = () => {
    if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.phoneNumber) {
        throw new Error('Twilio configuration is missing. Please check your .env file.');
    }
};

export {
    twilioConfig,
    twilioClient,
    validateTwilioConfig
}; 