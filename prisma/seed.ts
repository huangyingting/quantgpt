import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

/**
 * Production-grade reference data seed for QuantGPT.
 * IMPORTANT: Zero demo user accounts are created here.
 * Admin provisioning happens exclusively via `npm run bootstrap:admin`.
 */
async function main() {
  const existingPosts = await prisma.forumPost.count();
  if (existingPosts === 0) {
    const p1 = await prisma.forumPost.create({
      data: {
        authorHandle: 'quant_desk',
        authorRole: 'ADMIN',
        category: 'announcements',
        title: 'Warehouse update: 175 documented strategies & 2015 walk-forward split enforced across all studies',
        body: 'Every preset in the Strategy Library and every custom factor backtest now reports both in-sample (before 2015) and out-of-sample (2015–present) CAGR and Sharpe alongside our 11-check Skeptic challenge.',
        upvotes: 28,
      },
    });
    await prisma.forumReply.create({
      data: {
        postId: p1.id,
        authorHandle: 'macro_tape',
        body: 'Tested the Novy-Marx Gross Profitability x Momentum intersection with 15 bps round-trip cost — held up cleanly post-2015.',
      },
    });

    await prisma.forumPost.create({
      data: {
        authorHandle: 'factor_hunter',
        authorRole: 'PRO',
        category: 'findings',
        title: 'Piotroski F-Score >= 8 on bottom Value quintile: 16.4% CAGR vs 10.6% S&P 500 (DATA VALIDATED)',
        body: 'Attached study payload from the terminal. Notice how filtering out high-accrual names removes the 2001 and 2022 value traps.',
        studyPayloadJson: JSON.stringify({
          strategyId: 'val_01',
          finding: 'DATA VALIDATED',
          cagr: 16.4,
          benchCagr: 10.6,
          sharpe: 0.89,
          maxDrawdown: -31.2,
        }),
        upvotes: 19,
      },
    });

    await prisma.forumPost.create({
      data: {
        authorHandle: 'event_arb',
        authorRole: 'MEMBER',
        category: 'studies',
        title: 'Sanction & War Onset Event Guard: Pausing momentum entries 5 sessions around kinetic escalations',
        body: 'Using the World Events rule builder (Lesson 6), pausing new entries for 5 trading days around `war_onset` and `sanction` cut max drawdown by 4.1 percentage points with zero CAGR drag.',
        upvotes: 14,
      },
    });
  }

  const existingBoards = await prisma.teamBoard.count();
  if (existingBoards === 0) {
    await prisma.teamBoard.create({
      data: {
        name: 'Alpha Desk Shared Research',
        seatsJson: JSON.stringify([
          { seat: 1, role: 'Lead Quant', status: 'Active' },
          { seat: 2, role: 'Risk Skeptic', status: 'Invite Open' },
          { seat: 3, role: 'Macro Analyst', status: 'Invite Open' },
        ]),
        filesJson: JSON.stringify([
          { name: 'MU_DCF_Sensitivity_2026.csv', size: '18 KB', uploadedAt: '2026-10-14' },
          { name: 'Oil_Shocks_1973_2026_Study.json', size: '42 KB', uploadedAt: '2026-10-15' },
        ]),
        cards: {
          create: [
            {
              column: 'NOTES',
              title: 'Test 52-Week High Proximity + Low Short Interest',
              note: 'George & Hwang (2004) 52-week high anchor combined with short-interest < 3% of float.',
              author: 'Lead Quant',
            },
            {
              column: 'RUNNING',
              title: '200-Day Buffered Trend (+1% / -3% Band) + T-Bill Cash',
              note: 'Running 300-combination SMA x Hysteresis sweep across S&P 500 and NDX.',
              finding: 'TRADE-OFF',
              cagr: 10.8,
              sharpe: 0.94,
              maxDrawdown: -24.1,
              author: 'Lead Quant',
            },
            {
              column: 'DATA VALIDATED',
              title: 'Quality + 12-1M Momentum Top 20 Monthly',
              note: 'Passed 9/11 Skeptic checks including 25 bps friction and 2015 out-of-sample split.',
              finding: 'DATA VALIDATED',
              cagr: 15.8,
              sharpe: 0.91,
              maxDrawdown: -28.4,
              author: 'Lead Quant',
            },
          ],
        },
      },
    });
  }

  const userCount = await prisma.user.count();
  console.log(`Seed complete. Forum posts: ${await prisma.forumPost.count()}, Team boards: ${await prisma.teamBoard.count()}, Users in DB: ${userCount} (zero demo users created).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
