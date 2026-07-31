import type { WelcomePayload } from '../types';
import { renderButton } from '../components';
import { env } from '@/shared/config/env';
import { emailLayout } from './layout';

export const welcomeTemplate = ({ name }: WelcomePayload): string => {
  const content = `
    <p>Hi ${name},</p>
    <p>Welcome to Miio! We're thrilled to have you on board.</p>
    <p>Our platform is designed to provide you with the best experience. Feel free to explore our properties and manage your bookings effortlessly.</p>
    ${renderButton('Explore Miio', env.APP_URL)}
    <p>If you have any questions, our support team is always here to help.</p>
  `;

  return emailLayout('Welcome to Miio!', 'We are thrilled to have you on board.', content);
};
