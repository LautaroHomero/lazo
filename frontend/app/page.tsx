import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function HomePage() {
  const cookieStore = cookies();
  if (cookieStore.get('lazo_auth')?.value === 'true') {
    redirect('/dashboard?lang=en');
  }
  redirect('/auth');
}
