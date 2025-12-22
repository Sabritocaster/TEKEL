import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LoginForm from '../../features/auth/components/LoginForm';

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginForm />
    </div>
  );
}
