import type { ForgotPasswordPayload } from '../types';
import { renderOtpCard } from '../components';
import { emailLayout } from './layout';

export const forgotPasswordTemplate = ({ name, otp, expiryMinutes }: ForgotPasswordPayload): string => {
  const content = `
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your Miio account. Use the code below to reset it.</p>
    ${renderOtpCard(otp, expiryMinutes)}
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
  `;

  return emailLayout('Reset your password', 'Here is your password reset code.', content);
};
