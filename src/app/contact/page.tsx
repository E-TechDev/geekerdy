import type { Metadata } from 'next';
import ContactPage from '@/components/ContactPage';

export const metadata: Metadata = {
  title: 'Contact | Gee Kerdy',
  description: 'Book Gee Kerdy, send inquiries, and connect with the artist via email and social media.',
};

export default function Contact() {
  return <ContactPage />;
}
