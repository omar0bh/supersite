require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const nodemailer = require('nodemailer');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTelegramNotification = async (message) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('ℹ️ Telegram notifications not configured (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID missing).');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      console.log('✓ Telegram alert sent successfully.');
      return true;
    } else {
      const errorData = await response.json();
      console.error('⚠️ Telegram API error:', errorData);
      return false;
    }
  } catch (error) {
    console.error('⚠️ Failed to send Telegram notification:', error.message);
    return false;
  }
};

const sendEmailNotification = async (subject, text, html) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFICATION_EMAIL || user;

  if (!user || !pass) {
    console.log('ℹ️ Email notifications not configured (SMTP_USER/SMTP_PASS missing).');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: port === 465,
      auth: {
        user: user,
        pass: pass
      }
    });

    const info = await transporter.sendMail({
      from: `"SuperSite Alerts" <${user}>`,
      to: to,
      subject: subject,
      text: text,
      html: html
    });

    console.log('✓ Email alert sent successfully. MessageId:', info.messageId);
    return true;
  } catch (error) {
    console.error('⚠️ Failed to send Email notification:', error.message);
    return false;
  }
};

module.exports = {
  sendTelegramNotification,
  sendEmailNotification
};
