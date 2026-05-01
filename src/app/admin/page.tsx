import type { Metadata } from 'next';
import AdminPage from '@/components/AdminPage';

export const metadata: Metadata = {
  title: 'Admin | Gee Kerdy',
  description: 'Admin dashboard for managing returns, analytics, and featured releases.',
};

export default function Admin() {
  return <AdminPage />;
}
