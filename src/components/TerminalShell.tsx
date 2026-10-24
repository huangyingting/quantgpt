'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { EXPLAIN_MAP } from '@/lib/quant/warehouse';

type NavItem = {
  href: string;
  label: string;
  code: string;
  simple?: boolean;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'RESEARCH',
    items: [
      { href: '/terminal', label: 'Backtest', code: 'BT', simple: true },
      { href: '/library', label: 'Library (175)', code: 'LB', simple: true },
      { href: '/grade', label: 'Stock Grader', code: 'GR', simple: true },
      { href: '/halal', label: 'Halal Screen', code: 'HL' },
      { href: '/technicals', label: 'Technicals', code: 'TC' },
      { href: '/model', label: 'Valuation DCF', code: 'MD' },
      { href: '/board', label: 'Leaderboard', code: 'BD' },
    ],
  },
  {
    group: 'TRACK',
    items: [
      { href: '/journal', label: 'Findings Journal', code: 'JR' },
      { href: '/monitor', label: 'Live Monitor', code: 'MN' },
      { href: '/pm', label: 'Prediction Mkts', code: 'PM' },
      { href: '/events', label: 'World Events', code: 'EV' },
      { href: '/events/simulator', label: 'Crisis Simulator', code: 'SM' },
      { href: '/futuretest', label: 'Futuretest', code: 'FT' },
      { href: '/portfolio', label: 'Portfolio', code: 'PF', simple: true },
      { href: '/review', label: 'Portfolio Checkup', code: 'RV' },
      { href: '/runner', label: 'QuantGPT Cloud', code: 'CL' },
    ],
  },
  {
    group: 'YOUR AI & COURSES',
    items: [
      { href: '/chat', label: 'Ask AI', code: 'AI', simple: true },
      { href: '/connect', label: 'Connect AI (MCP)', code: 'CN' },
      { href: '/university', label: 'University', code: 'UN', simple: true },
      { href: '/learn', label: 'Playable Lessons', code: 'LN' },
      { href: '/tour', label: '7-Slide Tour', code: 'TR' },
    ],
  },
  {
    group: 'COMMUNITY & GOV',
    items: [
      { href: '/forum', label: 'Operator Forum', code: 'FM' },
      { href: '/team', label: 'Team Board', code: 'TM' },
      { href: '/verify', label: 'Verify Data', code: 'VF' },
      { href: '/account', label: 'Account', code: 'AC', simple: true },
      { href: '/admin', label: 'Admin Invites', code: 'AD' },
    ],
  },
];

const TAPE_ITEMS = [
  { ticker: 'SPY', price: '584.20', chg: '+0.62%', up: true },
  { ticker: 'QQQ', price: '496.85', chg: '+0.94%', up: true },
  { ticker: 'NVDA', price: '138.60', chg: '+2.41%', up: true },
  { ticker: 'MU', price: '108.40', chg: '+1.85%', up: true },
  { ticker: 'AAPL', price: '231.50', chg: '+0.64%', up: true },
  { ticker: 'MSFT', price: '428.90', chg: '+0.92%', up: true },
  { ticker: 'META', price: '589.20', chg: '+1.44%', up: true },
  { ticker: 'TSLA', price: '258.40', chg: '-1.12%', up: false },
  { ticker: 'WTI', price: '71.40', chg: '-0.85%', up: false },
  { ticker: '3M-TBILL', price: '4.35%', chg: '+0.01%', up: true },
];

export function TerminalShell({
  children,
  title,
  subtitle,
  explainPageKey,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  explainPageKey?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; role?: string; plan?: string; handle?: string } | undefined;

  const [uiMode, setUiMode] = useState<'simple' | 'all'>('all');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'night' | 'day'>('night');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentInput, setAgentInput] = useState('');
  const [agentMessages, setAgentMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; tool?: string }>>([
    {
      role: 'assistant',
      text: 'QuantGPT Desk AI armed with 19 core warehouse tools. Ask me to backtest a strategy, run the 11-check Skeptic challenge, grade a stock (e.g. "Grade MU"), check AAOIFI Halal compliance, or run a DCF valuation.',
    },
  ]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const savedMode = window.localStorage.getItem('qg_ui_mode');
    if (savedMode === 'simple' || savedMode === 'all') setUiMode(savedMode);
    const savedTheme = window.localStorage.getItem('qg_theme');
    if (savedTheme === 'day' || savedTheme === 'night') {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false);
        setExplainOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleUiMode = (next: 'simple' | 'all') => {
    setUiMode(next);
    window.localStorage.setItem('qg_ui_mode', next);
  };

  const toggleTheme = () => {
    const next = theme === 'night' ? 'day' : 'night';
    setTheme(next);
    window.localStorage.setItem('qg_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const sendAgentMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || agentLoading) return;
    const msg = agentInput.trim();
    setAgentInput('');
    setAgentMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setAgentLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setAgentMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply || 'Completed tool execution.', tool: data.toolUsed },
      ]);
    } catch {
      setAgentMessages((prev) => [...prev, { role: 'assistant', text: 'Error contacting warehouse tool runner.' }]);
    } finally {
      setAgentLoading(false);
    }
  };

  const allNavItems = NAV_GROUPS.flatMap((g) => g.items);
  const filteredPalette = allNavItems.filter(
    (i) =>
      !paletteQuery.trim() ||
      i.label.toLowerCase().includes(paletteQuery.toLowerCase()) ||
      i.href.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  const pageExplainEntries = explainPageKey && EXPLAIN_MAP[explainPageKey] ? Object.entries(EXPLAIN_MAP[explainPageKey]) : [];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--ink)]">
      {/* Top mobile bar */}
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-cond text-base font-bold tracking-wider">
          <span className="text-[var(--amber)]">▲</span> QUANTGPT
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="border border-[var(--line2)] bg-[var(--bg)] px-2 py-1 font-mono-num text-[11px]"
          >
            ⌘K
          </button>
          <button
            type="button"
            onClick={() => setAgentOpen(true)}
            className="border border-[var(--amber)] bg-[var(--amber)]/15 px-2 py-1 font-mono-num text-[11px] text-[var(--amber)]"
          >
            ASK AI
          </button>
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="border border-[var(--line2)] bg-[var(--bg)] px-2.5 py-1 font-mono-num text-[11px]"
          >
            {mobileNavOpen ? '✕' : '☰ DESK'}
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="border-b border-[var(--line)] bg-[var(--surface)] p-3 lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <div className="inline-flex border border-[var(--line2)] bg-[var(--bg)] p-0.5 font-mono-num text-[11px]">
              <button
                type="button"
                onClick={() => toggleUiMode('simple')}
                className={`px-2.5 py-1 ${uiMode === 'simple' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'text-[var(--muted)]'}`}
              >
                SIMPLE
              </button>
              <button
                type="button"
                onClick={() => toggleUiMode('all')}
                className={`px-2.5 py-1 ${uiMode === 'all' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'text-[var(--muted)]'}`}
              >
                EVERYTHING
              </button>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="border border-[var(--line2)] px-2.5 py-1 font-mono-num text-[11px] uppercase"
            >
              {theme === 'night' ? '☀ DAY' : '☾ NIGHT'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {allNavItems
              .filter((i) => (uiMode === 'simple' ? i.simple : true))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`border px-2.5 py-1.5 font-mono-num text-xs ${
                    pathname === item.href
                      ? 'border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)]'
                      : 'border-[var(--line)] bg-[var(--bg)] text-[var(--ink)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Left Sidebar #qgside */}
        <aside
          id="qgside"
          className={`hidden flex-col border-r border-[var(--line)] bg-[var(--surface)] lg:flex ${
            collapsed ? 'w-16' : 'w-60'
          } shrink-0 select-none transition-all`}
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] px-3.5 py-3">
            <Link href="/" className="flex items-center gap-2 font-cond text-base font-bold tracking-wider text-[var(--ink)]">
              <span className="text-[var(--amber)]">▲</span>
              {!collapsed && <span>QUANTGPT</span>}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title="Toggle sidebar width"
              className="font-mono-num text-xs text-[var(--muted)] hover:text-[var(--ink)]"
            >
              {collapsed ? '»' : '«'}
            </button>
          </div>

          {!collapsed && (
            <div className="border-b border-[var(--line)] p-2.5 space-y-2">
              <div id="qg-modeseg" className="grid grid-cols-2 border border-[var(--line2)] bg-[var(--bg)] p-0.5 font-mono-num text-[11px]">
                <button
                  type="button"
                  onClick={() => toggleUiMode('simple')}
                  className={`py-1 uppercase transition ${
                    uiMode === 'simple' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  Simple
                </button>
                <button
                  type="button"
                  onClick={() => toggleUiMode('all')}
                  className={`py-1 uppercase transition ${
                    uiMode === 'all' ? 'bg-[var(--amber)] font-bold text-[#0A0D13]' : 'text-[var(--muted)] hover:text-[var(--ink)]'
                  }`}
                >
                  Everything
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="flex w-full items-center justify-between border border-[var(--line)] bg-[var(--field)] px-2.5 py-1.5 font-mono-num text-xs text-[var(--muted)] hover:border-[var(--line2)] hover:text-[var(--ink)]"
              >
                <span>Jump / Search...</span>
                <kbd className="border border-[var(--line2)] px-1 text-[10px]">⌘K</kbd>
              </button>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
            {NAV_GROUPS.map((grp) => {
              const visibleItems = grp.items.filter((i) => (uiMode === 'simple' ? i.simple : true));
              if (visibleItems.length === 0) return null;
              return (
                <div key={grp.group}>
                  {!collapsed && (
                    <div className="px-2 pb-1 font-mono-num text-[10px] font-semibold uppercase tracking-widest text-[var(--faint)]">
                      {grp.group}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const active = pathname === item.href || (item.href !== '/terminal' && pathname?.startsWith(item.href + '/'));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 text-xs transition ${
                            active
                              ? 'border-l-2 border-[var(--amber)] bg-[var(--surface2)] font-semibold text-[var(--amber)]'
                              : 'text-[var(--body)] hover:bg-[var(--surface2)]/60 hover:text-[var(--ink)]'
                          }`}
                        >
                          <span className="w-5 font-mono-num text-[10px] text-[var(--faint)]">{item.code}</span>
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Sidebar footer utilities */}
          <div className="border-t border-[var(--line)] p-2.5 space-y-1.5 text-xs">
            <button
              id="qg-agent-btn"
              type="button"
              onClick={() => setAgentOpen(true)}
              className="flex w-full items-center justify-between border border-[var(--amber)]/50 bg-[var(--amber)]/10 px-2.5 py-1.5 font-mono-num text-xs font-semibold text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[#0A0D13]"
            >
              <span>▲ ASK DESK AI</span>
              {!collapsed && <span className="text-[10px]">LIVE</span>}
            </button>

            {!collapsed && (
              <div className="flex items-center justify-between gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => setExplainOpen(true)}
                  className="flex-1 border border-[var(--line)] bg-[var(--bg)] py-1 font-mono-num text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  ? EXPLAIN PAGE
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 font-mono-num text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  {theme === 'night' ? '☀ DAY' : '☾ NIGHT'}
                </button>
              </div>
            )}

            {!collapsed && (
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-2 font-mono-num text-[11px]">
                {user?.email ? (
                  <>
                    <div className="truncate text-[var(--ink)]" title={user.email}>
                      {user.handle || user.name || user.email.split('@')[0]}{' '}
                      <span className="text-[var(--amber)]">[{user.role || 'MEMBER'}]</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/signin' })}
                      className="text-[var(--muted)] hover:text-[var(--down)]"
                    >
                      OUT
                    </button>
                  </>
                ) : (
                  <div className="flex w-full items-center justify-between">
                    <Link href="/signin" className="text-[var(--amber)] hover:underline">
                      SIGN IN
                    </Link>
                    <Link href="/join" className="text-[var(--muted)] hover:text-[var(--ink)]">
                      INVITE CODE →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col pb-10">
          {/* Page Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] bg-[var(--surface)]/70 px-5 py-3.5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-cond text-xl font-bold uppercase tracking-wide text-[var(--ink)] sm:text-2xl">
                  {title}
                </h1>
                {pageExplainEntries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setExplainOpen(true)}
                    title="Explain every panel & metric on this page"
                    className="border border-[var(--line2)] bg-[var(--surface2)] px-2 py-0.5 font-mono-num text-[11px] text-[var(--amber)] hover:border-[var(--amber)]"
                  >
                    ? EXPLAIN ({pageExplainEntries.length})
                  </button>
                )}
              </div>
              {subtitle && <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <Link
                href="/tour"
                className="border border-[var(--line2)] bg-[var(--bg)] px-2.5 py-1 font-mono-num text-[11px] uppercase text-[var(--muted)] hover:border-[var(--amber)] hover:text-[var(--ink)]"
              >
                7-Slide Tour
              </Link>
              <button
                type="button"
                onClick={() => setAgentOpen(true)}
                className="border border-[var(--amber)] bg-[var(--amber)]/15 px-3 py-1 font-mono-num text-[11px] font-semibold uppercase text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[#0A0D13]"
              >
                Ask AI About Page
              </button>
            </div>
          </div>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>

      {/* Bottom Deskbar #qg-deskbar */}
      <div
        id="qg-deskbar"
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between border-t border-[var(--line)] bg-[var(--surface)] px-3 py-1 font-mono-num text-[11px] text-[var(--muted)]"
      >
        <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-[var(--up)]">
            <span className="inline-block h-2 w-2 rounded-full bg-[var(--up)]" />
            WAREHOUSE: 2026-10-16 · 97.4M BARS
          </span>
          <span className="text-[var(--line2)]">|</span>
          {TAPE_ITEMS.map((t) => (
            <Link
              key={t.ticker}
              href={`/grade?ticker=${t.ticker}`}
              className="flex items-center gap-1 hover:text-[var(--ink)]"
            >
              <span className="font-semibold text-[var(--ink)]">{t.ticker}</span>
              <span>{t.price}</span>
              <span className={t.up ? 'text-[var(--up)]' : 'text-[var(--down)]'}>{t.chg}</span>
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 pl-4 md:flex shrink-0">
          <Link href="/connect" className="text-[var(--amber)] hover:underline">
            MCP: /api/mcp (19 TOOLS)
          </Link>
          <span>·</span>
          <Link href="/verify" className="hover:text-[var(--ink)]">
            VERIFY SEC EDGAR
          </Link>
          <span>·</span>
          <Link href="/status" className="text-[var(--up)] hover:underline">
            ALL SYSTEMS OPERATIONAL
          </Link>
        </div>
      </div>

      {/* Command Palette #qg-pal */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 pt-20 p-4">
          <div
            id="qg-pal"
            className="w-full max-w-xl border border-[var(--line2)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="flex items-center border-b border-[var(--line)] px-3.5 py-2.5">
              <span className="mr-2 font-mono-num text-xs text-[var(--amber)]">⌘K</span>
              <input
                type="text"
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Jump to any desk, course, ticker (NVDA, MU, AAPL), or tool..."
                className="w-full bg-transparent font-mono-num text-xs text-[var(--ink)] outline-none"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="font-mono-num text-xs text-[var(--muted)]"
              >
                ESC
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line)]">
              {filteredPalette.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    setPaletteOpen(false);
                    router.push(item.href);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-[var(--surface2)]"
                >
                  <span className="font-medium text-[var(--ink)]">{item.label}</span>
                  <span className="font-mono-num text-[11px] text-[var(--muted)]">{item.href}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ask AI Slide-Over Drawer #qg-agent */}
      {agentOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div
            id="qg-agent"
            className="flex h-full w-full max-w-md flex-col border-l border-[var(--line2)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div>
                <div className="font-cond text-base font-bold uppercase text-[var(--amber)]">
                  ▲ QUANTGPT DESK AI AGENT
                </div>
                <div className="font-mono-num text-[11px] text-[var(--muted)]">
                  Connected to point-in-time warehouse & 11-check Skeptic
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAgentOpen(false)}
                className="border border-[var(--line2)] px-2 py-1 font-mono-num text-xs text-[var(--muted)] hover:text-[var(--ink)]"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 border-b border-[var(--line)] bg-[var(--bg)] px-3 py-2">
              {[
                'Backtest 12-1M Momentum + Quality',
                'Test 200-day SMA trend with buffer',
                'Grade MU and check Halal',
                'Run DCF model on MU',
                'World events: war_onset base rate',
              ].map((presetPrompt) => (
                <button
                  key={presetPrompt}
                  type="button"
                  onClick={() => setAgentInput(presetPrompt)}
                  className="border border-[var(--line2)] bg-[var(--surface)] px-2 py-1 font-mono-num text-[10px] text-[var(--body)] hover:border-[var(--amber)] hover:text-[var(--amber)]"
                >
                  {presetPrompt}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {agentMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`border p-3 leading-relaxed ${
                    m.role === 'user'
                      ? 'ml-6 border-[var(--amber)]/40 bg-[var(--amber)]/10 text-[var(--ink)]'
                      : 'mr-4 border-[var(--line)] bg-[var(--bg)] text-[var(--body)]'
                  }`}
                >
                  {m.tool && (
                    <div className="mb-1.5 inline-block border border-[var(--up)]/40 bg-[var(--up)]/10 px-1.5 py-0.5 font-mono-num text-[10px] text-[var(--up)]">
                      MCP TOOL: {m.tool}()
                    </div>
                  )}
                  <div className="whitespace-pre-line">{m.text}</div>
                </div>
              ))}
              {agentLoading && (
                <div className="border border-[var(--line)] bg-[var(--bg)] p-3 font-mono-num text-xs text-[var(--amber)]">
                  Executing warehouse query & Skeptic checks...
                </div>
              )}
            </div>

            <form onSubmit={sendAgentMessage} className="border-t border-[var(--line)] p-3 flex gap-2">
              <input
                type="text"
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                placeholder="Ask Desk AI to test an edge, grade a ticker, or model DCF..."
                className="flex-1 border border-[var(--line2)] bg-[var(--field)] px-3 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--amber)]"
              />
              <button
                type="submit"
                className="bg-[var(--amber)] px-3.5 py-2 font-mono-num text-xs font-bold uppercase text-[#0A0D13]"
              >
                RUN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Contextual Explain Drawer #qg-help */}
      {explainOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div
            id="qg-help"
            className="flex h-full w-full max-w-md flex-col border-l border-[var(--line2)] bg-[var(--surface)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
              <div>
                <div className="font-cond text-base font-bold uppercase text-[var(--amber)]">
                  ? PAGE EXPLAINER & GLOSSARY
                </div>
                <div className="font-mono-num text-[11px] text-[var(--muted)]">
                  Plain-English breakdown of every control on {title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExplainOpen(false)}
                className="border border-[var(--line2)] px-2 py-1 font-mono-num text-xs text-[var(--muted)]"
              >
                ✕ CLOSE
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pageExplainEntries.length > 0 ? (
                pageExplainEntries.map(([selector, info]) => (
                  <div key={selector} className="border border-[var(--line)] bg-[var(--bg)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-cond text-sm font-bold uppercase text-[var(--ink)]">
                        {info.title}
                      </span>
                      <span className="border border-[var(--line2)] px-1.5 py-0.5 font-mono-num text-[10px] uppercase text-[var(--amber)]">
                        {info.cat}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--body)]">{info.body}</p>
                    {info.uni && (
                      <Link
                        href={`/university/${info.uni}`}
                        className="mt-2 inline-block font-mono-num text-[11px] text-[var(--amber)] hover:underline"
                      >
                        Read in University: Chapter {info.uni} →
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="border border-[var(--line)] bg-[var(--bg)] p-4 text-xs text-[var(--body)]">
                  Use the interactive controls on this desk or open QuantGPT University for guided lessons and mastery quizzes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
