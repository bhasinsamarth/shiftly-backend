// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Mailjet from 'node-mailjet';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/send-invite', async (req, res) => {
  const { email, link } = req.body;
  if (!email || !link) {
    return res.status(400).json({ error: 'Missing email or link' });
  }

  try {
    await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: { Email: process.env.EMAIL_FROM, Name: 'Shiftly-NoReply' },
            To:   [{ Email: email }],
            Subject: 'Shiftly Account Invitation',
            HTMLPart: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Shiftly!</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    background: #fff;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    color: #222;
                  }
                  .container {
                    max-width: 480px;
                    margin: 0 auto;
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    padding: 32px 20px 24px 20px;
                  }
                  .title {
                    font-size: 1.6rem;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 18px;
                  }
                  .desc {
                    font-size: 1.05rem;
                    text-align: center;
                    margin-bottom: 28px;
                  }
                  .button {
                    display: block;
                    width: 200px;
                    margin: 0 auto 28px auto;
                    padding: 12px 0;
                    background: #1673ff;
                    color: #fff !important;
                    text-align: center;
                    border-radius: 6px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    text-decoration: none;
                  }
                  .footer {
                    font-size: 0.95rem;
                    color: #666;
                    text-align: center;
                    margin-top: 18px;
                  }
                  .small {
                    font-size: 0.85rem;
                    color: #aaa;
                    text-align: center;
                    margin-top: 18px;
                  }
                  @media (max-width: 600px) {
                    .container {
                      padding: 16px 4vw 16px 4vw;
                    }
                    .title {
                      font-size: 1.2rem;
                    }
                    .button {
                      width: 100%;
                      font-size: 1rem;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="title">Welcome to Shiftly!</div>
                  <div class="desc">Hi, you've been added to Shiftly by your manager. To get started, please click the button below to set up your account.</div>
                  <a href="${link}" class="button">Set Up Account</a>
                  <div class="footer">If you have any questions, please contact your manager or the Shiftly support team.</div>
                  <div class="small">This email was sent from Shiftly. You can manage your email preferences in your account settings.</div>
                </div>
              </body>
              </html>
            `,
          },
        ],
      });

    res.json({ status: 'sent' });
  } catch (err) {
     // 1) Log the full error to your console
     // 1) Log the full error to your console
    console.error('Mailjet error:', {
      statusCode: err.statusCode,
      message: err.message,
      // Mailjet puts the API response in err.response.body
      // Mailjet puts the API response in err.response.body
      responseBody: err.response && err.response.body,
    });

    // 2) Return that info to the front-end for easier debugging
    // 2) Return that info to the front-end for easier debugging
    res.status(500).json({
      error: err.message,
      statusCode: err.statusCode,
      details: err.response && err.response.body,
    });
  }
});

export default app;
