import type { Metadata } from "next";
import Link from "next/link";
import organizationData from "@/data/organization.json";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy — Taameer Artivists Foundation",
  description:
    "Understand Taameer Artivists Foundation's cancellation and refund policy before purchasing event passes.",
};

const { name, contact } = organizationData;

const sections = [
  {
    id: "cancellations",
    title: "1. Cancellations",
    content: (
      <p className="text-gray-400 leading-relaxed">
        Cancellations will be considered only if the request is made immediately
        after placing the order. However, the cancellation request may not be
        entertained if the orders have been communicated to the
        vendors/merchants and they have initiated the process of shipping them.
      </p>
    ),
  },
  {
    id: "non-cancellable",
    title: "2. Non-Cancellable Items",
    content: (
      <p className="text-gray-400 leading-relaxed">
        {name} does not accept cancellation requests for perishable items like
        flowers, eatables, etc. However, a refund or replacement can be made if
        the customer establishes that the quality of the product delivered is
        not good.
      </p>
    ),
  },
  {
    id: "damaged-or-defective",
    title: "3. Damaged or Defective Items",
    content: (
      <p className="text-gray-400 leading-relaxed">
        In case of receipt of damaged or defective items, please report the
        same to our Customer Service team. The request will be entertained once
        the merchant has checked and determined the same at his own end. This
        should be reported within{" "}
        <strong className="text-white">7 days</strong> of receipt of the
        products.
      </p>
    ),
  },
  {
    id: "not-as-described",
    title: "4. Product Not as Described",
    content: (
      <p className="text-gray-400 leading-relaxed">
        In case you feel that the product received is not as shown on the site
        or as per your expectations, you must bring it to the notice of our
        Customer Service team within{" "}
        <strong className="text-white">7 days</strong> of receiving the
        product. The Customer Service Team, after looking into your complaint,
        will take an appropriate decision.
      </p>
    ),
  },
  {
    id: "warranty",
    title: "5. Warranty Claims",
    content: (
      <p className="text-gray-400 leading-relaxed">
        In case of complaints regarding products that come with a warranty from
        manufacturers, please refer the issue to them directly.
      </p>
    ),
  },
  {
    id: "refund-processing",
    title: "6. Refund Processing",
    content: (
      <p className="text-gray-400 leading-relaxed">
        In case of any refunds approved by {name}, it will take{" "}
        <strong className="text-white">6–8 days</strong> for the refund to be
        processed to the end customer.
      </p>
    ),
  },
  {
    id: "contact",
    title: "7. Contact Us",
    content: (
      <>
        <p className="text-gray-400 leading-relaxed mb-5">
          To raise a cancellation or refund request, reach out to our team:
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

export default function CancellationRefundPage() {
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
            Cancellation &amp;<br />
            <span className="text-yellow-400">Refund Policy</span>
          </h1>
          <p className="text-gray-500 text-sm mt-6">
            Last updated:{" "}
            <time dateTime="2026-05-12">May 12, 2026</time>
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
            <strong className="text-white">{name}</strong> believes in helping
            its customers as far as possible, and has therefore a liberal
            cancellation policy. Please read the terms below carefully before
            completing your purchase.
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
