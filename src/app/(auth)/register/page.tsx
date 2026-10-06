'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

async function onSubmit(e: React.FormEvent) {
  e.preventDefault();

  setLoading(true);
  setError(null);

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.');
      return;
    }

    const signInRes = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (signInRes?.error) {
      router.push('/login');
      return;
    }

    router.push('/');
    router.refresh();
  } catch (error) {
    console.error('Registration failed:', error);

    setError(
      'Could not create your account. Please check your connection and try again.'
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="container flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:py-16">
      <Logo />
      <div className="w-full min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-8">
        <h1 className="break-words font-display text-2xl font-semibold text-branch-900">
  Create your account
</h1>
        <p className="mt-1 break-words text-sm text-muted-foreground">
  Join a safer marketplace in a couple of minutes.
</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
         {error && (
  <p className="break-words text-sm text-destructive">
    {error}
  </p>
)}
          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={() => signIn('google', { callbackUrl: '/' })}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-branch-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
