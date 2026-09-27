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
  <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
    <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-background/95 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0 max-w-3xl text-sm leading-6 text-muted-foreground">
          <p>
            Branched uses essential technologies needed for authentication,
            security, session management, and reliable operation. Optional
            cookies will only be used with your permission.
          </p>

          <p className="mt-1.5">
            Learn more in our{' '}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline underline-offset-4 hover:text-branch-600"
            >
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link
              href="/terms"
              className="font-medium text-foreground underline underline-offset-4 hover:text-branch-600"
            >
              Terms & Conditions
            </Link>
            .
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => saveConsent('rejected')}
            className="min-h-11 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Reject optional
          </button>

          <button
            type="button"
            onClick={() => saveConsent('accepted')}
            className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  </div>
);
}