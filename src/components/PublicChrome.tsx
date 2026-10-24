'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/terminal', label: 'Terminal' },
    { href: '/library', label: '175 Strategies' },
    { href: '/learn', label: 'Courses & Learn' },
    { href: '/university', label: 'University' },
    { href: '/learn/become-a-quant', label: 'Become a Quant' },
    { href: '/learn/headline-check', label: 'Headline Check' },
    { href: '/mcp', label: 'MCP Server' },
    { href: '/data-warehouse', label: 'Data Warehouse' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-cond text-lg font-bold tracking-wider text-[var(--ink)]">
            <span className="text-[var(--amber)]">▲</span>
            <span>QUANTGPT</span>
          </Link>
          <nav className="hidden lg:flex lg:items-center lg:gap-5">
            {navLinks.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-mono-num text-xs uppercase tracking-wider transition ${
                    active ? 'text-[var(--amber)] font-semibold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/signin"
            className="border border-[var(--line2)] bg-[var(--surface)] px-3 py-1.5 font-mono-num text-xs uppercase tracking-wider text-[var(--ink)] hover:border-[var(--amber)]"
          >
            Sign In
          </Link>
          <Link
            href="/join"
            className="border border-[var(--amber)] bg-[var(--amber)]/15 px-3 py-1.5 font-mono-num text-xs font-semibold uppercase tracking-wider text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[#0A0D13]"
          >
            Redeem Invite
          </Link>
          <Link
            href="/terminal"
            className="bg-[var(--amber)] px-3.5 py-1.5 font-mono-num text-xs font-bold uppercase tracking-wider text-[#0A0D13] hover:opacity-90"
          >
            Open Terminal →
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="border border-[var(--line2)] bg-[var(--surface)] px-2.5 py-1.5 font-mono-num text-xs text-[var(--ink)] lg:hidden"
        >
          {mobileOpen ? '✕ CLOSE' : '☰ MENU'}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border border-[var(--line)] bg-[var(--bg)] px-3 py-2 font-mono-num text-xs uppercase text-[var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--line)] pt-3">
            <Link href="/signin" className="border border-[var(--line2)] px-3 py-1.5 font-mono-num text-xs uppercase">
              Sign In
            </Link>
            <Link href="/join" className="border border-[var(--amber)] px-3 py-1.5 font-mono-num text-xs uppercase text-[var(--amber)]">
              Redeem Invite
            </Link>
            <Link href="/terminal" className="bg-[var(--amber)] px-3 py-1.5 font-mono-num text-xs font-bold uppercase text-[#0A0D13]">
              Open Terminal →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--muted)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-cond text-base font-bold text-[var(--ink)]">
              <span className="text-[var(--amber)]">▲</span> QUANTGPT
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              Trading is war. Arm your AI with data. Point-in-time US equities warehouse, 175 documented strategies, and MCP server.
            </p>
            <p className="mt-3 font-mono-num text-[11px] text-[var(--faint)]">
              Invite-only operator admission · Zero custody of funds.
            </p>
          </div>

          <div>
            <div className="font-mono-num text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)]">Research Desk</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/terminal" className="hover:text-[var(--amber)]">Backtest Engine</Link></li>
              <li><Link href="/library" className="hover:text-[var(--amber)]">175 Strategy Library</Link></li>
              <li><Link href="/grade" className="hover:text-[var(--amber)]">Stock Grader (A–F)</Link></li>
              <li><Link href="/halal" className="hover:text-[var(--amber)]">Halal Screen (AAOIFI)</Link></li>
              <li><Link href="/technicals" className="hover:text-[var(--amber)]">Technicals & Signals</Link></li>
              <li><Link href="/model" className="hover:text-[var(--amber)]">DCF Valuation Model</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono-num text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)]">Courses & Tools</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/tour" className="hover:text-[var(--amber)]">7-Slide Interactive Tour</Link></li>
              <li><Link href="/learn" className="hover:text-[var(--amber)]">Playable Lessons 1–7</Link></li>
              <li><Link href="/university" className="hover:text-[var(--amber)]">QuantGPT University</Link></li>
              <li><Link href="/learn/become-a-quant" className="hover:text-[var(--amber)]">Become a Quant</Link></li>
              <li><Link href="/learn/headline-check" className="hover:text-[var(--amber)]">The Headline Check</Link></li>
              <li><Link href="/learn/verdict" className="hover:text-[var(--amber)]">The Findings System</Link></li>
              <li><Link href="/learn/resources" className="hover:text-[var(--amber)]">91 Research Papers</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono-num text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)]">Platform & AI</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/mcp" className="hover:text-[var(--amber)]">MCP Connector</Link></li>
              <li><Link href="/data-warehouse" className="hover:text-[var(--amber)]">Data Warehouse</Link></li>
              <li><Link href="/execution" className="hover:text-[var(--amber)]">Execution & Alpaca</Link></li>
              <li><Link href="/transmissions" className="hover:text-[var(--amber)]">Transmissions</Link></li>
              <li><Link href="/events/oil-shocks" className="hover:text-[var(--amber)]">Oil Shocks Study</Link></li>
              <li><Link href="/compare/best-backtesting-platforms-2026" className="hover:text-[var(--amber)]">2026 Platform Compare</Link></li>
              <li><Link href="/whats-new" className="hover:text-[var(--amber)]">What&apos;s New</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono-num text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)]">Trust & Governance</div>
            <ul className="mt-3 space-y-2">
              <li><Link href="/verify" className="hover:text-[var(--amber)]">Verify Our Numbers</Link></li>
              <li><Link href="/status" className="hover:text-[var(--amber)]">System Status</Link></li>
              <li><Link href="/admin" className="hover:text-[var(--amber)]">Admin Invite Console</Link></li>
              <li><Link href="/security" className="hover:text-[var(--amber)]">Security</Link></li>
              <li><Link href="/is-quantgpt-legit" className="hover:text-[var(--amber)]">Is QuantGPT Legit?</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--amber)]">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--amber)]">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-5 font-mono-num text-[11px] text-[var(--muted)]">
          <Link href="/terms" className="hover:text-[var(--amber)]">Terms</Link>
          <Link href="/privacy" className="hover:text-[var(--amber)]">Privacy</Link>
          <Link href="/cookies" className="hover:text-[var(--amber)]">Cookies</Link>
          <Link href="/disclosures" className="hover:text-[var(--amber)]">Disclosures</Link>
          <Link href="/business-terms" className="hover:text-[var(--amber)]">Business terms</Link>
          <Link href="/dmca" className="hover:text-[var(--amber)]">Copyright</Link>
          <Link href="/eula" className="hover:text-[var(--amber)]">EULA</Link>
          <Link href="/security" className="hover:text-[var(--amber)]">Security</Link>
          <Link href="/is-quantgpt-legit" className="hover:text-[var(--amber)]">Is QuantGPT legit?</Link>
          <Link href="/cookies#ad-choices" className="hover:text-[var(--amber)]">Do Not Sell or Share My Personal Information</Link>
        </div>

        <div className="mt-4 text-[11px] leading-relaxed text-[var(--faint)]">
          QuantGPT is a quantitative financial research and historical backtesting platform. Nothing on QuantGPT constitutes personalized investment advice, a solicitation, or brokerage custody. Past performance (in-sample or out-of-sample) does not guarantee future results.
        </div>
      </div>
    </footer>
  );
}
