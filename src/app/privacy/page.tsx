import type { Metadata } from "next";
import type { ReactNode } from "react";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What Nokoo collects — account and download records, an anonymous daily usage count, and Relay delivery metadata — and what it never does.",
};

const CONTACT = site.contact;

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <main className="overflow-x-clip">
      <article className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 27 September 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Section heading="In short">
            <p>
              We collect metadata, not content. We know who has an account, which builds each
              account downloaded and from which IP address, and how many installations of the
              desktop app are in use. We never receive your notifications, prompts, code, files,
              projects, or usage figures from the desktop app, and nothing we collect is sold or used
              for advertising.
            </p>
          </Section>

          <Section heading="Who is responsible">
            <p>
              nokoo.ai, Nokoo accounts, desktop downloads, the usage count, and the hosted preview of
              Nokoo Relay are operated by Kabani Tech Private Limited, Bengaluru, Karnataka, India,
              which is the data controller for the data described here.
            </p>
            <p>
              Where Nokoo Relay is run privately by another organization under an agreement
              with us, that organization is the data controller for its instance, and Kabani Tech
              Private Limited does not receive its data.
            </p>
          </Section>

          <Section heading="Accounts">
            <p>
              A Nokoo account holds your email address, a password hash (the password itself is never
              stored), your plan, and when the account was created and last signed in. An account is
              needed to download the desktop apps, because Nokoo is not open source and has no public
              release page.
            </p>
          </Section>

          <Section heading="Downloads">
            <p>Each time you download a desktop build, we record:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>your account;</li>
              <li>the version, platform, and processor architecture of the build;</li>
              <li>the date and time;</li>
              <li>your IP address; and</li>
              <li>your browser&apos;s user-agent string.</li>
            </ul>
            <p>
              We use these records to count downloads by platform and version, to operate and secure
              the download service, and to detect abuse such as redistributing installers. They are
              kept for two years and deleted with your account.
            </p>
          </Section>

          <Section heading="The desktop app's usage count">
            <p>
              Once a day while it runs, the desktop app tells us it is in use by sending exactly five
              things: a random installation identifier, the operating system (Windows, macOS, or
              Linux), its version, the processor architecture, and the Nokoo version.
            </p>
            <p>
              The installation identifier is generated at random on your computer the first time the
              app sends a count. It is not derived from your hardware, your name, your user or computer
              name, or your account, and the message carries no account or credential, so we cannot
              link it to you or to a download. We do not store your IP address with it. We keep one
              record per installation (its identifier, platform, latest versions, and when it was
              first and last seen) and a record of each day it was active, which is deleted after
              about thirteen months.
            </p>
            <p>
              You can turn the count off at any time: in Settings on Windows, on the About page of the
              web interface, with <span className="font-mono text-foreground">&quot;usagePingsEnabled&quot;: false</span>{" "}
              in the app&apos;s configuration file, or with the environment variable{" "}
              <span className="font-mono text-foreground">NOKOO_USAGE_PINGS=0</span>. Section 4 of the{" "}
              <a href="/eula/" className="underline underline-offset-4 hover:text-foreground">End User Licence Agreement</a>{" "}
              says the same.
            </p>
            <p>
              Everything else the desktop app does stays on your computer: notification history,
              usage and cost figures, quota, router traffic, and channel settings. Data leaves it only
              through a channel you configure yourself — Relay, a messaging service, or a model
              provider through the router — and only what that channel needs.
            </p>
          </Section>

          <Section heading="What the relay stores">
            <p>For each account and paired device, the relay stores:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <span className="text-foreground">Account data:</span> your email address and a
                password hash. The password itself is never stored.
              </li>
              <li>
                <span className="text-foreground">Identity data:</span> installation and device
                identifiers, and the public keys a device registers so envelopes can be sealed for
                it.
              </li>
              <li>
                <span className="text-foreground">Delivery data:</span> encrypted envelope
                ciphertext, delivery attempts and their result codes, and acknowledgements.
              </li>
              <li>
                <span className="text-foreground">Technical data:</span> request timestamps and
                source addresses needed to rate-limit and secure the service.
              </li>
            </ul>
          </Section>

          <Section heading="What the relay cannot read">
            <p>
              Notification payloads are encrypted on your computer for each paired device before
              they are sent. The relay holds opaque ciphertext and the metadata needed to route it.
              It does not have notification plaintext and does not hold device private keys. Push
              wake-ups sent through Firebase Cloud Messaging carry only an opaque reference to the
              waiting envelope — no title, message, agent, project, or file path.
            </p>
            <p>
              Relay can still observe delivery metadata such as timestamps, envelope sizes, delivery
              frequency, and source addresses. It is not a metadata-private system, and it does not
              claim to be one.
            </p>
          </Section>

          <Section heading="How long data is kept">
            <p>Default retention on the hosted preview:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Encrypted envelopes: 72 hours after acceptance.</li>
              <li>Delivery attempts and result codes: 14 days.</li>
              <li>Audit events: 30 days.</li>
              <li>Interaction answers: 7 days, or until the requesting installation reads them.</li>
              <li>Download records, including IP address: 2 years.</li>
              <li>Daily usage-count activity: about 13 months.</li>
            </ul>
            <p>
              Account records are kept while the account exists. Deleting an account deletes its
              download records.
            </p>
          </Section>

          <Section heading="Payments">
            <p>
              Subscriptions are paid through Stripe or Razorpay, which act as independent processors
              of your payment details under their own privacy policies. We receive and keep only
              what billing needs: the provider's customer, subscription, and payment identifiers,
              the plan, the amount and currency, the payment status, and the billing period. We
              never receive or store card numbers, bank details, or UPI identifiers. Billing records
              are kept for as long as tax and accounting law requires.
            </p>
          </Section>

          <Section heading="Push delivery">
            <p>
              Android wake-ups are sent through Firebase Cloud Messaging so the phone can fetch its
              encrypted envelope promptly. The push payload is opaque and contains no notification
              content. A phone without push registration still receives envelopes by polling; push
              only shortens the delay.
            </p>
          </Section>

          <Section heading="What we do not do">
            <p>
              We do not sell personal data, and we do not use notification content, download
              records, the usage count, or delivery metadata for advertising. We run no third-party
              analytics or tracking on nokoo.ai or in the desktop app. The only data the desktop app
              sends us on its own is the usage count described above. The operator console shows
              delivery metadata and result codes only — never notification plaintext, ciphertext, or
              decoded content.
            </p>
          </Section>

          <Section heading="Your rights">
            <p>
              Subject to applicable law, you can request access to the personal data held about you,
              ask for correction, request deletion of your account and its data, request an export,
              or lodge a complaint. To make a request, email{" "}
              <a
                href={`mailto:${CONTACT}`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {CONTACT}
              </a>
              . Requests about a privately operated instance must go to the operator of that
              instance.
            </p>
          </Section>

          <Section heading="Children">
            <p>
              Nokoo and the hosted relay are not directed at children and is not intended for use by anyone
              under 13. We do not knowingly collect data from children.
            </p>
          </Section>

          <Section heading="Changes">
            <p>
              This policy may change as the preview develops. A new version will be posted on this
              page with its own update date, and material changes will be described plainly rather
              than buried.
            </p>
          </Section>

          <Section heading="Contact">
            <p>
              Questions about this policy:{" "}
              <a
                href={`mailto:${CONTACT}`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {CONTACT}
              </a>
              , or by post to Kabani Tech Private Limited, Bengaluru, Karnataka, India.
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}
