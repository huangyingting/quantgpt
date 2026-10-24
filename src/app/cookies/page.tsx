import React from 'react';
import { PublicHeader, PublicFooter } from '@/components/PublicChrome';

export default function CookiesPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      <PublicHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 space-y-6">
        <div className="font-mono-num text-xs uppercase tracking-widest text-[var(--amber)]">
          LEGAL · COOKIE & STORAGE NOTICE
        </div>
        <h1 className="font-cond text-4xl font-bold uppercase">Cookies & Local Storage</h1>
        <div className="border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4 text-xs leading-relaxed text-[var(--body)]">
          <p>
            QuantGPT uses strictly necessary HTTP-only session cookies to authenticate your operator account and local browser storage (<code className="text-[var(--amber)]">localStorage</code>) to remember your desk layout, theme (Night/Day), Simple vs Everything mode, and client-encrypted broker keys.
          </p>
          <h2 className="font-cond text-lg font-bold uppercase text-[var(--ink)]">1. Essential Session Cookies</h2>
          <p>
            Authentication tokens are signed and verified via NextAuth/Auth.js to protect your workspace and enforce invite-only admission.
          </p>
          <h2 id="ad-choices" className="font-cond text-lg font-bold uppercase text-[var(--ink)]">
            2. Do Not Sell or Share My Personal Information
          </h2>
          <p>
            QuantGPT does not sell, rent, or share personal information or saved strategy rules with third-party advertising networks or data brokers. We run zero third-party ad trackers.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
