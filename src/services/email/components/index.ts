import { env } from '@/shared/config/env';

export const renderHeader = () => `
  <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #E5E7EB;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #111827;">Miio</h1>
  </div>
`;

export const renderFooter = () => `
  <div style="text-align: center; padding-top: 24px; border-top: 1px solid #E5E7EB; margin-top: 32px;">
    <p style="margin: 0; font-size: 14px; color: #6B7280;">
      © ${new Date().getFullYear()} Miio. All rights reserved.
    </p>
    <p style="margin: 8px 0 0; font-size: 14px; color: #6B7280;">
      <a href="${env.APP_URL}" style="color: #6B7280; text-decoration: underline;">Visit our website</a>
    </p>
  </div>
`;

export const renderButton = (label: string, href: string) => `
  <div style="text-align: center; margin: 32px 0;">
    <a href="${href}" style="background-color: #111827; color: #FFFFFF; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: 500; display: inline-block;">
      ${label}
    </a>
  </div>
`;

export const renderOtpCard = (otp: string, expiryMinutes: number) => `
  <div style="background-color: #F3F4F6; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0;">
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${otp}</div>
    <div style="font-size: 14px; color: #6B7280; margin-top: 8px;">This code expires in ${expiryMinutes} minutes.</div>
  </div>
`;
