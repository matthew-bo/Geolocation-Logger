const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Initialize nodemailer with your SMTP settings
const transporter = nodemailer.createTransport({
  host: functions.config().smtp.host,
  port: functions.config().smtp.port,
  secure: true,
  auth: {
    user: functions.config().smtp.user,
    pass: functions.config().smtp.pass,
  },
});

// Rate limiting configuration
const rateLimits = {
  emailSendLimit: 3, // Maximum number of emails per time window
  timeWindow: 15 * 60 * 1000, // 15 minutes in milliseconds
};

// Email template for password reset
const getPasswordResetEmailTemplate = (code) => {
  return {
    text: `Your verification code is: ${code}. This code will expire in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #2b1810; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #fbb034; margin: 0; text-align: center;">Password Reset Code</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            You requested a password reset. Here's your verification code:
          </p>
          
          <div style="background-color: #fff; padding: 15px; border-radius: 4px; border: 2px solid #fbb034; text-align: center; margin: 20px 0;">
            <code style="font-size: 24px; color: #2b1810; letter-spacing: 3px;">${code}</code>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            This code will expire in 15 minutes. If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `
  };
};

// Cleanup function for expired codes
const cleanupExpiredCodes = async () => {
  const now = admin.firestore.Timestamp.now();
  const codesRef = admin.firestore().collection('passwordResetCodes');
  
  try {
    // Query for expired codes
    const expiredCodes = await codesRef
      .where('expiresAt', '<', now)
      .get();

    // Delete expired codes
    const batch = admin.firestore().batch();
    expiredCodes.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    if (expiredCodes.docs.length > 0) {
      await batch.commit();
      console.log(`Cleaned up ${expiredCodes.docs.length} expired reset codes`);
    }
  } catch (error) {
    console.error('Error cleaning up expired codes:', error);
  }
};

// Schedule cleanup every hour
exports.scheduledCleanup = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async (context) => {
    await cleanupExpiredCodes();
    return null;
  });

exports.sendEmail = functions.https.onCall(async (data, context) => {
  try {
    // Check if the request is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    // Get user's email send history
    const userRef = admin.firestore().collection('users').doc(context.auth.uid);
    const userDoc = await userRef.get();
    const emailHistory = userDoc.data()?.emailHistory || [];

    // Clean up old entries
    const now = Date.now();
    const recentEmails = emailHistory.filter(
      entry => now - entry.timestamp < rateLimits.timeWindow
    );

    // Check rate limit
    if (recentEmails.length >= rateLimits.emailSendLimit) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        `Rate limit exceeded. Please try again after ${Math.ceil((rateLimits.timeWindow - (now - recentEmails[0].timestamp)) / 60000)} minutes.`
      );
    }

    // Get email template
    const emailTemplate = getPasswordResetEmailTemplate(data.text.split(': ')[1].split('.')[0]);

    // Send the email
    await transporter.sendMail({
      from: functions.config().smtp.from,
      to: data.to,
      subject: data.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    });

    // Update email history
    await userRef.update({
      emailHistory: admin.firestore.FieldValue.arrayUnion({
        timestamp: now,
        type: 'password_reset',
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
}); 