import type { Metadata } from "next";
import type { ReactNode } from "react";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms for Nokoo accounts, desktop downloads, and the hosted Nokoo Relay service.",
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

export default function TermsPage() {
  return (
    <main className="overflow-x-clip">
      <article className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: 27 September 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Section heading="Acceptance">
            <p>
              These terms apply to Nokoo accounts, to downloading the Nokoo desktop applications,
              and to the hosted preview of Nokoo Relay, all operated by Kabani Tech Private Limited.
              By creating an account, downloading, or using the hosted service, you agree to them. The
              desktop applications themselves are licensed under the{" "}
              <a href="/eula/" className="underline underline-offset-4 hover:text-foreground">
                End User Licence Agreement
              </a>
              . If you do not agree, do not create an account or use the service.
            </p>
          </Section>

          <Section heading="Accounts">
            <p>
              Provide an accurate email address and keep your password secure. One account per
              person. You are responsible for activity under your account, including paired senders
              and devices. Tell us promptly at{" "}
              <a
                href={`mailto:${CONTACT}`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {CONTACT}
              </a>{" "}
              if you believe your account or a paired device has been compromised.
            </p>
          </Section>

          <Section heading="Downloads">
            <p>
              A free account lets you download the desktop applications for your own use under the
              End User Licence Agreement. Download links are personal and expire after a few
              minutes. Do not share them, and do not republish or host the installers anywhere else;
              each person must download from their own account. Each download is recorded as the{" "}
              <a href="/privacy/" className="underline underline-offset-4 hover:text-foreground">
                privacy policy
              </a>{" "}
              describes, and we may withdraw downloads from an account that redistributes them.
            </p>
          </Section>

          <Section heading="Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>send spam, abuse, malware, or illegal content through the service;</li>
              <li>
                attempt to break, bypass, or reverse the pairing or encryption model, or access
                another account's data;
              </li>
              <li>
                resell the hosted service, or provide it to third parties as your own service,
                without a written agreement with us; or
              </li>
              <li>use the service in a way that degrades it for other people or breaks the law.</li>
            </ul>
            <p>
              We may suspend or terminate an account that does these things, and may report unlawful
              behavior where required.
            </p>
          </Section>

          <Section heading="Plans and billing">
            <p>
              The hosted service is sold as monthly subscriptions: Basic, Standard, and Pro, at the
              prices shown on the pricing page in the currency you are charged in. Payments are
              processed by Stripe or Razorpay; we do not receive or store your card or bank details.
              A plan starts when the payment provider confirms the payment.
            </p>
            <p>
              You can cancel at any time from the console; the plan stays active until the end of
              the period you have paid for, and is not renewed after it. If a renewal fails, the
              payment provider retries it; if the subscription ends, the account moves to the Basic
              allowance and paired senders keep delivering. Where a relay has not enabled billing,
              choosing a plan records interest only and nothing is charged. We will describe any
              price change on this page and by email before it applies to a renewal.
            </p>
          </Section>

          <Section heading="Software">
            <p>
              Nokoo, the broker that runs on your own machine, Nokoo Relay, and the Nokoo mobile application are
              proprietary software of Kabani Tech Private Limited. The desktop applications are licensed to you under
              the End User Licence Agreement that ships with them as EULA.txt; the relay and the mobile application are
              provided to you as a service under these terms. No other right to copy, modify, or redistribute any of
              them is granted.
            </p>
          </Section>

          <Section heading="Availability and support">
            <p>
              We aim to keep the hosted service available but do not promise any particular uptime
              or support response except where a plan says otherwise.
            </p>
          </Section>

          <Section heading="Intellectual property">
            <p>
              The Nokoo and Nokoo Relay names, the hosted service, and its branding
              belong to Kabani Tech Private Limited. Third-party components remain under their own
              licenses. You keep ownership of the content your agents send; we claim no license to
              it beyond what is needed to operate the transport.
            </p>
          </Section>

          <Section heading="Disclaimers">
            <p>
              The hosted service is provided without warranties of any kind, express or implied,
              including fitness for a particular purpose and uninterrupted availability. Envelope
              encryption is implemented but has not received a focused external review, and the
              mobile client is still in development. Do not rely on the preview as the only copy of
              anything important.
            </p>
          </Section>

          <Section heading="Limitation of liability">
            <p>
              To the maximum extent permitted by law, Kabani Tech Private Limited is not liable for
              indirect, incidental, special, or consequential damages, or for lost profits, data, or
              business opportunity arising from use of the hosted preview. Where liability cannot be
              excluded, it is limited to the amount you paid for the service in the twelve months
              before the claim — which, during the preview, is nothing.
            </p>
          </Section>

          <Section heading="Termination">
            <p>
              You can stop using the service at any time and ask for your account to be deleted. We
              may suspend or terminate access for a breach of these terms or to protect the service.
              Provisions that by their nature should survive termination do so.
            </p>
          </Section>

          <Section heading="Changes to these terms">
            <p>
              These terms may change as the preview develops. A new version will be posted on this
              page with its own update date. Continuing to use the hosted service after a change
              means you accept the new version.
            </p>
          </Section>

          <Section heading="Governing law">
            <p>
              These terms are governed by the laws of India, and the courts at Bengaluru, Karnataka
              have exclusive jurisdiction over any dispute arising from them or from the hosted
              service.
            </p>
          </Section>

          <Section heading="Contact">
            <p>
              Questions about these terms:{" "}
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
