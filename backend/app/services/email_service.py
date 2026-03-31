from app.core.config import SEND_GRID_API,VERIFICATION_EMAIL_FROM
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import logging
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.api_key = SEND_GRID_API
        self.from_email = VERIFICATION_EMAIL_FROM

        if not self.api_key:
            logger.error("SENDGRID_API_KEY not set in environment")
            raise ValueError("SENDGRID_API_KEY not set in environment")

        self.client = SendGridAPIClient(self.api_key)

    def send_verification_email(self, to_email: str, verification_link: str, user_name: str = "there"):
        logger.info(f"Preparing to send verification email to {to_email}")
        html_content = f"""
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto;">
          
          <h2 style="color: #333;">Welcome to AI Icon Generator 👋</h2>
          
          <p>Hi {user_name},</p>
          
          <p>You're one step away from creating stunning app icons.</p>

          <p>Please verify your email by clicking the button below:</p>

          <a href="{verification_link}" 
             style="display:inline-block;
                    padding:12px 20px;
                    margin:15px 0;
                    font-size:16px;
                    color:#ffffff;
                    background-color:#4CAF50;
                    text-decoration:none;
                    border-radius:6px;">
             Verify Email
          </a>

          <p style="margin-top: 10px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #555;">{verification_link}</p>

          <p>This link will expire in 24 hours.</p>

          <p>If you didn’t create this account, you can safely ignore this email.</p>

          <hr style="margin: 20px 0;" />

          <p style="font-size: 12px; color: gray;">
            — Team AI Icon Generator
          </p>

        </div>
        """
        logger.info(f"Sending verification email to {to_email}")
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject="Verify your email to start generating icons 🚀",
            html_content=html_content
        )

        try:
            print(f"from_email: {self.from_email}, to_email: {to_email}")
            response = self.client.send(message)
            logger.info(f"Email sent to {to_email} with status code {response.status_code}")
            print(response.body)
            return {
                "success": True,
                "status_code": response.status_code
            }
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            print(f"Full error: {e}")
            return {
                "success": False,
                "error": str(e)
            }