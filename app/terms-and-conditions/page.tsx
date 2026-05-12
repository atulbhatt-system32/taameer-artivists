import type { Metadata } from "next";
import Link from "next/link";
import organizationData from "@/data/organization.json";

export const metadata: Metadata = {
  title: "Terms & Conditions — Taameer Artivists Foundation",
  description:
    "Read the Terms and Conditions governing your use of Taameer Artivists Foundation's website and services.",
};

const { name, contact } = organizationData;

const sections = [
  {
    id: "agreement",
    title: "1. Agreement to Terms",
    content: (
      <p className="text-gray-400 leading-relaxed">
        These Terms and Conditions, along with the Privacy Policy or other
        terms (&ldquo;Terms&rdquo;), constitute a binding agreement by and
        between <strong className="text-white">{name}</strong>{" "}
        (&ldquo;Website Owner&rdquo; or &ldquo;we&rdquo; or &ldquo;us&rdquo;
        or &ldquo;our&rdquo;) and you (&ldquo;you&rdquo; or &ldquo;your&rdquo;)
        and relate to your use of our website, goods (as applicable), or
        services (as applicable) (collectively, &ldquo;Services&rdquo;). By
        using our website and availing the Services, you agree that you have
        read and accepted these Terms (including the Privacy Policy). We reserve
        the right to modify these Terms at any time and without assigning any
        reason. It is your responsibility to periodically review these Terms to
        stay informed of updates.
      </p>
    ),
  },
  {
    id: "account-registration",
    title: "2. Account & Registration",
    content: (
      <p className="text-gray-400 leading-relaxed">
        To access and use the Services, you agree to provide true, accurate, and
        complete information to us during and after registration, and you shall
        be responsible for all acts done through the use of your registered
        account.
      </p>
    ),
  },
  {
    id: "no-warranty",
    title: "3. No Warranty",
    content: (
      <p className="text-gray-400 leading-relaxed">
        Neither we nor any third parties provide any warranty or guarantee as to
        the accuracy, timeliness, performance, completeness, or suitability of
        the information and materials offered on this website or through the
        Services for any specific purpose. You acknowledge that such information
        and materials may contain inaccuracies or errors, and we expressly
        exclude liability for any such inaccuracies or errors to the fullest
        extent permitted by law.
      </p>
    ),
  },
  {
    id: "use-at-own-risk",
    title: "4. Use at Your Own Risk",
    content: (
      <p className="text-gray-400 leading-relaxed">
        Your use of our Services and the website is solely at your own risk and
        discretion. You are required to independently assess and ensure that the
        Services meet your requirements.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property",
    content: (
      <p className="text-gray-400 leading-relaxed">
        The contents of the website and the Services are proprietary to us, and
        you will not have any authority to claim any intellectual property
        rights, title, or interest in its contents. Unauthorized use of the
        website or the Services may lead to action against you as per these
        Terms or applicable laws.
      </p>
    ),
  },
  {
    id: "charges",
    title: "6. Charges & Payment",
    content: (
      <p className="text-gray-400 leading-relaxed">
        You agree to pay us the charges associated with availing the Services.
        Upon initiating a transaction for availing the Services, you are
        entering into a legally binding and enforceable contract with us for the
        Services.
      </p>
    ),
  },
  {
    id: "prohibited-use",
    title: "7. Prohibited Use",
    content: (
      <p className="text-gray-400 leading-relaxed">
        You agree not to use the website and/or Services for any purpose that is
        unlawful, illegal, or forbidden by these Terms, or Indian or local laws
        that might apply to you.
      </p>
    ),
  },
  {
    id: "third-party-links",
    title: "8. Third-Party Links",
    content: (
      <p className="text-gray-400 leading-relaxed">
        You agree and acknowledge that the website and the Services may contain
        links to other third-party websites. On accessing these links, you will
        be governed by the terms of use, privacy policy, and such other policies
        of such third-party websites.
      </p>
    ),
  },
  {
    id: "refunds",
    title: "9. Refunds",
    content: (
      <p className="text-gray-400 leading-relaxed">
        You shall be entitled to claim a refund of the payment made by you in
        case we are not able to provide the Service. The timelines for such
        return and refund will be according to the specific Service you have
        availed or within the time period provided in our policies (as
        applicable). In case you do not raise a refund claim within the
        stipulated time, this would make you ineligible for a refund.
      </p>
    ),
  },
  {
    id: "force-majeure",
    title: "10. Force Majeure",
    content: (
      <p className="text-gray-400 leading-relaxed">
        Notwithstanding anything contained in these Terms, the parties shall not
        be liable for any failure to perform an obligation under these Terms if
        performance is prevented or delayed by a force majeure event.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "11. Governing Law & Jurisdiction",
    content: (
      <p className="text-gray-400 leading-relaxed">
        These Terms and any dispute or claim relating to it, or its
        enforceability, shall be governed by and construed in accordance with
        the laws of India. All disputes arising out of or in connection with
        these Terms shall be subject to the exclusive jurisdiction of the courts
        in <strong className="text-white">Haldwani, Uttarakhand</strong>.
      </p>
    ),
  },
  {
    id: "contact",
    title: "12. Contact Us",
    content: (
      <>
        <p className="text-gray-400 leading-relaxed mb-5">
          All concerns or communications relating to these Terms must be
          communicated to us using the contact information below:
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

export default function TermsAndConditionsPage() {
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
            Terms &amp;<br />
            <span className="text-yellow-400">Conditions</span>
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
            The use of this website or availing of our Services is subject to
            the following terms of use. Please read them carefully before
            proceeding.
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
              href="/privacy-policy"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/cancellation-and-refund"
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Cancellation &amp; Refund
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
