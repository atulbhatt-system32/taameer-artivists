import type { Metadata } from "next";
import Link from "next/link";
import organizationData from "@/data/organization.json";

export const metadata: Metadata = {
  title: "Privacy Policy — Taameer Artivists Foundation",
  description:
    "Learn how Taameer Artivists Foundation collects, uses, and protects your personal information.",
};

const { name, contact } = organizationData;

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: (
      <>
        <p className="text-gray-400 leading-relaxed mb-4">
          When you register for an event or interact with our platform, we may
          collect the following information:
        </p>
        <ul className="list-disc list-outside pl-5 space-y-2 text-gray-400">
          <li>
            <strong className="text-white">Personal identifiers</strong> — your
            full name, email address, and phone/WhatsApp number provided during
            registration or contact forms.
          </li>
          <li>
            <strong className="text-white">Payment information</strong> —
            transaction ID and order details processed securely through our
            payment gateway. We never store your card or banking details on our
            servers.
          </li>
          <li>
            <strong className="text-white">Usage data</strong> — browser type,
            device, IP address, referring URL, and pages visited, collected
            automatically through standard web analytics.
          </li>
          <li>
            <strong className="text-white">Communication data</strong> —
            messages or inquiries you send us via email or WhatsApp.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: (
      <>
        <p className="text-gray-400 leading-relaxed mb-4">
          We use the information we collect solely to deliver and improve our
          services:
        </p>
        <ul className="list-disc list-outside pl-5 space-y-2 text-gray-400">
          <li>Process your event registration and confirm your booking.</li>
          <li>
            Send you event details, entry passes, and reminders via WhatsApp
            and email.
          </li>
          <li>Share post-event materials, photos, or updates where applicable.</li>
          <li>
            Notify you about upcoming programs and events that may interest you.
            You can opt out at any time.
          </li>
          <li>
            Analyse aggregate usage to improve our platform and event
            experiences.
          </li>
          <li>Comply with legal obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    title: "3. Sharing of Information",
    content: (
      <p className="text-gray-400 leading-relaxed">
        We do not sell, rent, or trade your personal information. We share data
        only with trusted service providers who help us operate our platform —
        including our payment gateway for ticket processing — all of whom are
        bound by confidentiality obligations and applicable data protection
        laws. We may also disclose information if required by law or to protect
        the rights, property, or safety of {name} or its community.
      </p>
    ),
  },
  {
    id: "data-retention",
    title: "4. Data Retention",
    content: (
      <p className="text-gray-400 leading-relaxed">
        We retain your personal information for as long as necessary to fulfil
        the purposes described in this policy, or as required by law.
        Registration and payment records are kept for a minimum of five years
        to satisfy financial and legal obligations. You may request deletion of
        your personal data at any time (subject to these obligations) by
        contacting us.
      </p>
    ),
  },
  {
    id: "security",
    title: "5. Data Security",
    content: (
      <p className="text-gray-400 leading-relaxed">
        We implement industry-standard technical and organisational measures to
        protect your information from unauthorised access, alteration,
        disclosure, or destruction. All payment transactions are encrypted via
        SSL and processed through our PCI-DSS compliant payment gateway. While
        we strive to protect your data, no method of transmission over the
        internet is 100% secure.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "6. Cookies & Tracking",
    content: (
      <>
        <p className="text-gray-400 leading-relaxed mb-4">
          Our website uses cookies and similar tracking technologies to enhance
          your experience and understand how visitors interact with our content:
        </p>
        <ul className="list-disc list-outside pl-5 space-y-2 text-gray-400">
          <li>
            <strong className="text-white">Essential cookies</strong> — required
            for the site to function correctly.
          </li>
          <li>
            <strong className="text-white">Analytics cookies</strong> — used to
            measure traffic and page performance.
          </li>
        </ul>
        <p className="text-gray-400 leading-relaxed mt-4">
          You can disable cookies through your browser settings, though doing so
          may affect some site functionality.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    content: (
      <>
        <p className="text-gray-400 leading-relaxed mb-4">You have the right to:</p>
        <ul className="list-disc list-outside pl-5 space-y-2 text-gray-400">
          <li>Access the personal data we hold about you and receive a copy.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>
            Request deletion of your personal data, subject to legal retention
            obligations.
          </li>
          <li>Withdraw consent for marketing communications at any time.</li>
          <li>Lodge a complaint with the relevant data protection authority.</li>
        </ul>
        <p className="text-gray-400 leading-relaxed mt-4">
          To exercise any of these rights, please contact us using the details
          below.
        </p>
      </>
    ),
  },
  {
    id: "third-party",
    title: "8. Third-Party Links",
    content: (
      <p className="text-gray-400 leading-relaxed">
        Our platform may contain links to third-party websites such as Instagram,
        YouTube, or Facebook. We are not responsible for the privacy practices of
        those platforms and encourage you to review their respective privacy
        policies.
      </p>
    ),
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: (
      <p className="text-gray-400 leading-relaxed">
        We may update this Privacy Policy from time to time to reflect changes in
        our practices or applicable law. When we do, we will revise the
        &ldquo;Last updated&rdquo; date at the top of this page. We encourage
        you to review this policy periodically.
      </p>
    ),
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: (
      <>
        <p className="text-gray-400 leading-relaxed mb-5">
          If you have any questions or requests regarding this Privacy Policy,
          please reach out:
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <p className="font-bold text-white text-base">{name}</p>
          <p className="text-gray-500 text-sm">{contact.address}</p>
          <a
            href={`mailto:${contact.email}`}
            className="block text-yellow-400 text-sm hover:underline"
          >
            {contact.email}
          </a>
          <a
            href={`tel:${contact.phone}`}
            className="block text-yellow-400 text-sm hover:underline"
          >
            {contact.phone}
          </a>
        </div>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="border-b border-white/8 bg-gray-950/90 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center">
              <span className="text-xs font-black text-gray-900">TA</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm tracking-wider uppercase text-white">Taameer</span>
              <span className="font-black text-[10px] tracking-[0.3em] uppercase text-yellow-400">Artivists</span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-white/8 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-yellow-400" />
            <span className="text-yellow-400 text-xs font-black tracking-[0.3em] uppercase">Legal</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-4">
            Privacy<br />
            <span className="text-yellow-400">Policy</span>
          </h1>
          <p className="text-gray-500 text-sm mt-6">
            Last updated: <time dateTime="2026-05-12">May 12, 2026</time>
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 py-16 lg:grid lg:grid-cols-[200px_1fr] lg:gap-16">

        {/* Sidebar TOC */}
        <aside className="hidden lg:block">
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-gray-600 mb-5">
            Contents
          </p>
          <nav className="flex flex-col gap-1 sticky top-24">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-[13px] text-gray-500 hover:text-yellow-400 transition-colors py-0.5 font-medium"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="space-y-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-gray-400 leading-relaxed">
            This Privacy Policy explains how{" "}
            <strong className="text-white">{name}</strong> (&ldquo;we&rdquo;,
            &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, uses, and protects
            information you provide when accessing our website or purchasing
            event passes. By using our platform, you agree to the practices
            described below.
          </div>

          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-xl font-black text-white mb-4 tracking-tight">
                {s.title}
              </h2>
              {s.content}
            </section>
          ))}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/8 bg-gray-950 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/cancellation-and-refund"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Cancellation &amp; Refund
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
