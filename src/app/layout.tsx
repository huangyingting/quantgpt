import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'QuantGPT — The Data and Trading Platform for AI',
  description:
    'Trading is war. Arm your AI with data. Backtest 175 documented strategies on decades of point-in-time US stock data, grade stocks across 6 dimensions, study 19 world event kinds, and connect Claude or ChatGPT over MCP.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="night">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased selection:bg-[#F0A83C]/30 selection:text-[#F0A83C]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
