import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Branched',
  description:
    'Learn how Branched collects, uses, stores, and protects information when you use the marketplace.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Legal
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: September 14, 2026
        </p>
      </div>

      <div className="space-y-10 text-sm leading-7 text-muted-foreground sm:text-base">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            1. Introduction
          </h2>

          <p>
            Branched is a community marketplace that allows users to discover,
            create, and manage listings for goods, housing, jobs, services,
            vehicles, education, and community opportunities.
          </p>

          <p className="mt-4">
            This Privacy Policy explains what information Branched may collect
            when you use the platform, why that information is collected, how
            it may be used, and the choices available to you.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            2. Information we collect
          </h2>

          <p>
            The information Branched processes depends on how you use the
            platform. This may include:
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              <strong className="text-foreground">Account information:</strong>{' '}
              information you provide when creating or managing your account,
              such as your name, email address, and profile information.
            </li>

            <li>
              <strong className="text-foreground">Profile information:</strong>{' '}
              information you choose to make available through your public
              profile.
            </li>

            <li>
              <strong className="text-foreground">Listing information:</strong>{' '}
              titles, descriptions, prices, locations, categories,
              characteristics, images, and other information you submit when
              creating a listing.
            </li>

            <li>
              <strong className="text-foreground">Messages:</strong>{' '}
              communications sent through Branched between users.
            </li>

            <li>
              <strong className="text-foreground">Marketplace activity:</strong>{' '}
              information such as favorites, listing views, listing status,
              reports, and other interactions with the platform.
            </li>

            <li>
              <strong className="text-foreground">
                Safety and moderation information:
              </strong>{' '}
              reports, moderation actions, account restrictions, and
              information used to investigate suspicious or abusive activity.
            </li>

            <li>
              <strong className="text-foreground">Technical information:</strong>{' '}
              information such as IP address, browser or device information,
              request activity, and security-related data that may be processed
              when you access Branched.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            3. How we use information
          </h2>

          <p>Branched may use information to:</p>

          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Create and maintain user accounts.</li>
            <li>Display and manage marketplace listings.</li>
            <li>Enable communication between marketplace users.</li>
            <li>Provide favorites, notifications, and account features.</li>
            <li>Operate search, filtering, and discovery features.</li>
            <li>Detect spam, fraud, abuse, and suspicious activity.</li>
            <li>Investigate reports and enforce marketplace rules.</li>
            <li>Protect Branched, its infrastructure, and its users.</li>
            <li>Diagnose technical problems and improve the platform.</li>
            <li>Comply with applicable legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            4. Public information
          </h2>

          <p>
            Branched is a marketplace, which means some information you provide
            is intended to be visible to other users.
          </p>

          <p className="mt-4">
            Public information may include your profile information, seller
            information, listings, listing images, listing locations, and other
            information you deliberately publish through the marketplace.
          </p>

          <p className="mt-4">
            You should avoid including sensitive personal information in public
            listings, descriptions, images, or profile fields unless it is
            necessary and you are comfortable making it visible to others.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            5. Messages between users
          </h2>

          <p>
            Branched provides communication features that allow users to
            contact each other regarding listings.
          </p>

          <p className="mt-4">
            Messages may be stored so that conversations can be delivered,
            displayed to participants, investigated when abuse is reported,
            and protected against spam or misuse.
          </p>

          <p className="mt-4">
            Do not send passwords, financial credentials, identification
            documents, or other highly sensitive information through
            marketplace messages.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            6. Transactions and payments
          </h2>

          <p>
            Branched primarily helps users discover each other and communicate
            about marketplace opportunities. Unless explicitly stated
            otherwise for a particular feature, Branched does not process or
            hold payments made directly between buyers, sellers, landlords,
            tenants, employers, service providers, or other users.
          </p>

          <p className="mt-4">
            Users are responsible for deciding how to complete transactions and
            should take appropriate precautions before sending money or
            exchanging goods or services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            7. Service providers
          </h2>

          <p>
            Branched may rely on third-party service providers to operate
            parts of the platform. These providers may support functions such
            as hosting, databases, authentication, image storage, security,
            infrastructure, and application delivery.
          </p>

          <p className="mt-4">
            These providers may process limited information where necessary to
            provide their services to Branched and are subject to their own
            legal and privacy obligations.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            8. Cookies and similar technologies
          </h2>

          <p>
            Branched may use cookies or similar technologies that are necessary
            for features such as authentication, session management, security,
            preferences, and reliable operation of the platform.
          </p>

          <p className="mt-4">
            Where optional cookies or similar technologies require consent,
            Branched will provide users with an appropriate choice before those
            technologies are enabled.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            9. Spam, fraud, and platform security
          </h2>

          <p>
            Branched may process account activity, request information,
            messaging activity, listings, reports, and technical data to detect
            spam, automated abuse, fraudulent behavior, security threats, and
            violations of marketplace rules.
          </p>

          <p className="mt-4">
            Accounts or activity that present a risk to users or the platform
            may be restricted, reviewed, suspended, or removed.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            10. How long information is kept
          </h2>

          <p>
            Branched may retain information for as long as reasonably necessary
            to operate the platform, maintain accounts, provide requested
            features, resolve disputes, investigate abuse, protect users,
            maintain security, and comply with legal obligations.
          </p>

          <p className="mt-4">
            Some information may remain in backups, security records, or
            legally required records for a limited period after it is no longer
            visible through the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            11. Protecting your information
          </h2>

          <p>
            Branched uses reasonable technical and organizational measures
            designed to protect information from unauthorized access, misuse,
            alteration, or disclosure.
          </p>

          <p className="mt-4">
            However, no online platform can guarantee absolute security. Users
            should protect their account credentials, use strong passwords, and
            report suspicious account activity.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            12. Your choices and rights
          </h2>

          <p>
            Depending on your location and applicable law, you may have rights
            regarding your personal information. These may include the ability
            to request access, correction, deletion, restriction, or other
            information about how your data is processed.
          </p>

          <p className="mt-4">
            Some account and profile information can be updated directly
            through Branched. Other requests may be made using the contact
            information provided by Branched.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            13. Children
          </h2>

          <p>
            Branched is not intended for children who are not legally permitted
            to independently use marketplace services in their jurisdiction.
            Users must meet any minimum age requirements that apply to their use
            of the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            14. Changes to this Privacy Policy
          </h2>

          <p>
            Branched may update this Privacy Policy as the platform develops or
            as legal, technical, or operational requirements change.
          </p>

          <p className="mt-4">
            When changes are made, the updated date at the top of this page
            will be revised. Material changes may also be communicated through
            the platform where appropriate.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            15. Contact
          </h2>

          <p>
            If you have questions about this Privacy Policy or how information
            is handled by Branched, you can contact Branched using the contact
            information made available through the platform.
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