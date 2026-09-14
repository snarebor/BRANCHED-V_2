'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_CONSENT_KEY = 'branched-cookie-consent';

type CookieConsentValue = 'accepted' | 'rejected';

export function CookieConsent() {
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedConsent = window.localStorage.getItem(
      COOKIE_CONSENT_KEY,
    ) as CookieConsentValue | null;

    setConsent(savedConsent);
    setHydrated(true);
  }, []);

  function saveConsent(value: CookieConsentValue) {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    setConsent(value);
  }

  if (!hydrated || consent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 shadow-lg backdrop-blur">
      <div className="container mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl text-sm leading-6 text-muted-foreground">
          <p>
            Branched uses essential technologies needed for authentication,
            security, session management, and reliable operation. Optional
            cookies will only be used with your permission.
          </p>

          <p className="mt-2">
            You can learn more in our{' '}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link
              href="/terms"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Terms & Conditions
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => saveConsent('rejected')}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Reject optional cookies
          </button>

          <button
            type="button"
            onClick={() => saveConsent('accepted')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}