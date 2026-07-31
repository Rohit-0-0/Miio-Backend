import type { VerifyEmailPayload } from '../types';
import { renderOtpCard } from '../components';
import { emailLayout } from './layout';

export const verifyEmailTemplate = ({ name, otp, expiryMinutes }: VerifyEmailPayload): string => {
  const content = `
    <p>Hi ${name},</p>
    <p>Thanks for getting started with Miio. Please use the verification code below to confirm your email address.</p>
    ${renderOtpCard(otp, expiryMinutes)}
    <p>If you didn't request this, you can safely ignore this email.</p>
  `;

  return emailLayout('Verify your email address', 'Here is your Miio verification code.', content);
};
