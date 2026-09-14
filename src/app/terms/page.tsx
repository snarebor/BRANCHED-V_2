import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Branched',
  description:
    'Read the terms that govern use of the Branched marketplace and its community features.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Legal
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms & Conditions
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: September 14, 2026
        </p>
      </div>

      <div className="space-y-10 text-sm leading-7 text-muted-foreground sm:text-base">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            1. About Branched
          </h2>

          <p>
            Branched is a community marketplace that allows users to discover,
            create, manage, and communicate about listings for goods, housing,
            jobs, services, vehicles, education, and community opportunities.
          </p>

          <p className="mt-4">
            Branched provides the platform and tools that help users connect.
            Unless explicitly stated otherwise, Branched is not the buyer,
            seller, landlord, tenant, employer, employee, service provider, or
            other party to transactions arranged between users.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            2. Acceptance of these terms
          </h2>

          <p>
            By accessing or using Branched, you agree to comply with these Terms
            & Conditions and any other rules, policies, or notices that apply to
            your use of the platform.
          </p>

          <p className="mt-4">
            If you do not agree with these terms, you should not use Branched.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            3. Eligibility and accounts
          </h2>

          <p>
            You must be legally permitted to use online marketplace services in
            your jurisdiction.
          </p>

          <p className="mt-4">
            When creating an account, you are responsible for providing accurate
            information and maintaining the security of your account credentials.
          </p>

          <p className="mt-4">
            You are responsible for activity carried out through your account
            unless that activity results from a security failure attributable to
            Branched.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            4. Marketplace listings
          </h2>

          <p>
            Users may create listings for categories supported by Branched.
            Listings must be accurate, lawful, and not misleading.
          </p>

          <p className="mt-4">You must not post listings that:</p>

          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Contain false, deceptive, or materially misleading information.</li>
            <li>Promote illegal goods, services, activities, or transactions.</li>
            <li>Impersonate another person or organization.</li>
            <li>Use stolen, unauthorized, or misleading images.</li>
            <li>Contain malicious links, scams, phishing attempts, or malware.</li>
            <li>Harass, threaten, exploit, or discriminate against others unlawfully.</li>
            <li>Violate intellectual property, privacy, or other legal rights.</li>
            <li>Attempt to manipulate search, visibility, or platform systems.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            5. User-to-user transactions
          </h2>

          <p>
            Users are responsible for evaluating listings, communicating with
            other users, verifying relevant information, and deciding whether to
            proceed with a transaction.
          </p>

          <p className="mt-4">
            Unless Branched explicitly provides a payment feature for a specific
            transaction, payments and exchanges are arranged directly between
            users.
          </p>

          <p className="mt-4">
            Branched does not guarantee the quality, safety, legality,
            availability, condition, authenticity, or accuracy of anything
            offered by users.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            6. Safety
          </h2>

          <p>
            Users should exercise reasonable caution when communicating,
            exchanging goods, attending meetings, viewing property, accepting
            employment, hiring services, or transferring money.
          </p>

          <p className="mt-4">
            Where appropriate, users should verify identities, inspect goods,
            confirm important details independently, use secure payment methods,
            and meet in safe locations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            7. Messaging and communications
          </h2>

          <p>
            Branched may provide messaging features to allow users to communicate
            about listings and marketplace activity.
          </p>

          <p className="mt-4">
            You must not use Branched messaging to send spam, scams, threats,
            harassment, malicious links, unauthorized advertising, or other
            abusive content.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            8. Reports and moderation
          </h2>

          <p>
            Users may report listings, accounts, or activity that they believe
            violates Branched rules or presents a safety concern.
          </p>

          <p className="mt-4">
            Branched may investigate reports and may remove content, restrict
            features, suspend accounts, ban accounts, or take other reasonable
            action when necessary to protect users or the platform.
          </p>

          <p className="mt-4">
            Moderation decisions may consider platform activity, reports,
            account history, security signals, and other relevant information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            9. Prohibited conduct
          </h2>

          <p>You must not:</p>

          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Use Branched for unlawful purposes.</li>
            <li>Attempt to gain unauthorized access to accounts or systems.</li>
            <li>Use bots or automated tools to abuse platform features.</li>
            <li>Scrape or collect user information without authorization.</li>
            <li>Send spam or repeatedly contact users in an abusive manner.</li>
            <li>Attempt to bypass rate limits or security controls.</li>
            <li>Interfere with the normal operation of Branched.</li>
            <li>Submit fraudulent reports or deliberately misuse moderation tools.</li>
            <li>Create accounts to evade suspensions or bans.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            10. User content
          </h2>

          <p>
            You retain responsibility for content you submit to Branched,
            including listings, images, profile information, messages, and other
            material.
          </p>

          <p className="mt-4">
            By submitting content that must be displayed or processed through
            Branched, you grant Branched the limited permission necessary to
            host, store, reproduce, display, and process that content for the
            purpose of operating and improving the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            11. Intellectual property
          </h2>

          <p>
            Branched, its branding, interface, software, and original platform
            content may be protected by intellectual property laws.
          </p>

          <p className="mt-4">
            These terms do not grant users ownership of Branched software,
            branding, or proprietary platform materials.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            12. Availability of the platform
          </h2>

          <p>
            Branched may change, suspend, remove, or discontinue features as the
            platform develops.
          </p>

          <p className="mt-4">
            Branched does not guarantee that every feature will always be
            available, uninterrupted, secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            13. Account restrictions and termination
          </h2>

          <p>
            Branched may restrict, suspend, or terminate access where there is a
            reasonable belief that an account has violated these terms, abused
            the platform, created safety risks, or threatened platform security.
          </p>

          <p className="mt-4">
            Certain information may be retained after account restriction or
            termination where reasonably necessary for security, fraud
            prevention, dispute resolution, or legal obligations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            14. Disclaimer
          </h2>

          <p>
            Branched provides a marketplace platform and does not independently
            verify every user, listing, statement, image, product, service,
            property, employment opportunity, or transaction.
          </p>

          <p className="mt-4">
            Users should independently evaluate information before relying on it
            or entering into a transaction.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            15. Limitation of liability
          </h2>

          <p>
            To the extent permitted by applicable law, Branched is not
            responsible for losses arising solely from agreements, payments,
            meetings, disputes, or transactions made directly between users.
          </p>

          <p className="mt-4">
            Nothing in these terms excludes or limits liability where doing so
            would be prohibited by applicable law.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            16. Privacy
          </h2>

          <p>
            Information about how Branched processes personal information is
            described in the{' '}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            17. Changes to these terms
          </h2>

          <p>
            Branched may update these Terms & Conditions as the platform,
            marketplace rules, or legal requirements develop.
          </p>

          <p className="mt-4">
            The updated date shown at the top of this page will be revised when
            changes are made.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            18. Contact
          </h2>

          <p>
            Questions about these Terms & Conditions can be submitted using the
            contact information made available through Branched.
          </p>
        </section>

        <div className="border-t border-border pt-8">
          <Link
            href="/"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Return to Branched
          </Link>
        </div>
      </div>
    </div>
  );
}