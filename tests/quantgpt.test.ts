import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  createInvitation,
  inspectInvitationToken,
  acceptInvitationAndRegister,
  revokeInvitation,
} from '@/lib/account-admission/invitations';
import {
  STRATEGIES,
  WORLD_KINDS,
  STUDIES,
  RESOURCES,
  OIL_SHOCKS,
  verifyWarehouseBar,
  getStrategyCounts,
} from '@/lib/quant/warehouse';
import { runBacktest, runParameterSweep } from '@/lib/quant/backtester';
import { gradeStock, batchGradeStocks } from '@/lib/quant/grader';
import { runDcfModel, exportDcfToCsv } from '@/lib/quant/dcf';
import { computeTechnicals } from '@/lib/quant/technicals';
import { analyzeHeadlineCheck, SAMPLE_HEADLINE_TRACKS } from '@/lib/quant/headline-check';
import { UNIVERSITY_CHAPTERS, getUniversityChapter } from '@/lib/quant/university';

describe('QuantGPT Warehouse Datasets & Verification', () => {
  it('loads 175 strategies, 19 world event kinds, 39 studies, 91 resources, and 49 oil shocks', () => {
    expect(STRATEGIES.length).toBe(175);
    const counts = getStrategyCounts();
    expect(counts.total).toBe(175);
    expect(counts.validated + counts.tradeOff + counts.noEdge).toBe(175);
    expect(Object.keys(WORLD_KINDS).length).toBe(19);
    expect(STUDIES.length).toBeGreaterThanOrEqual(39);
    expect(RESOURCES.length).toBe(91);
    expect(OIL_SHOCKS.length).toBe(49);
  });

  it('produces deterministic SHA-256 point-in-time bar verification proofs', () => {
    const proof1 = verifyWarehouseBar('NVDA', '2024-06-14');
    const proof2 = verifyWarehouseBar('NVDA', '2024-06-14');
    expect(proof1.sha256).toBe(proof2.sha256);
    expect(proof1.sha256).toHaveLength(64);
    expect(proof1.pointInTimeLagDays).toBe(45);
    expect(proof1.survivorshipBiasFree).toBe(true);
  });
});

describe('QuantGPT Backtester, Walk-Forward Split & 11-Check Skeptic', () => {
  it('runs cross-sectional factor backtest with 2015 split and 11 skeptic checks', () => {
    const bt = runBacktest({
      engine: 'equity',
      presetId: 'mom_01',
      topN: 20,
      rebalance: 'M',
      costBps: 10,
      splitYear: 2015,
    });
    expect(bt.equityCurve.length).toBeGreaterThanOrEqual(29);
    expect(bt.splitYear).toBe(2015);
    expect(bt.skeptic.totalCount).toBe(11);
    expect(bt.skeptic.checks).toHaveLength(11);
    expect(bt.currentHoldings.length).toBeGreaterThan(0);
    expect(['DATA VALIDATED', 'TRADE-OFF', 'NO EDGE']).toContain(bt.verdict);
  });

  it('runs market timing regime backtest and parameter sweep', () => {
    const timing = runBacktest({
      engine: 'timing',
      smaWindow: 200,
      entryBandPct: 1,
      exitBandPct: 3,
      cashSource: 'tbill',
      splitYear: 2015,
    });
    expect(timing.engine).toBe('timing');
    expect(timing.metrics.maxDrawdownPct).toBeGreaterThan(-40);

    const sweep = runParameterSweep('mom_01');
    expect(sweep.cells).toHaveLength(12);
    expect(sweep.plateauScorePct).toBeGreaterThanOrEqual(0);
  });
});

describe('Stock Grader, AAOIFI Halal Screen, Technicals, DCF & University', () => {
  it('grades stocks across 6 dimensions, accounting scores, and 5 AAOIFI Halal tests', () => {
    const nvda = gradeStock('NVDA');
    expect(nvda.ticker).toBe('NVDA');
    expect(nvda.accountingScores.piotroskiF).toBeGreaterThanOrEqual(0);
    expect(nvda.accountingScores.piotroskiF).toBeLessThanOrEqual(9);
    expect(nvda.halal.tests).toHaveLength(5);
    expect(nvda.halal.status).toBe('HALAL');

    const jpm = gradeStock('JPM');
    expect(jpm.halal.status).toBe('NON_HALAL');

    const batch = batchGradeStocks(['NVDA', 'MU', 'AAPL']);
    expect(batch).toHaveLength(3);
  });

  it('computes 10-year DCF valuation, reverse-DCF implied growth, and 5x5 sensitivity grid', () => {
    const dcf = runDcfModel({
      ticker: 'MU',
      growthY1_5Pct: 18,
      ebitMarginTargetPct: 28,
      waccPct: 9.5,
      terminalGrowthPct: 2.5,
    });
    expect(dcf.projections).toHaveLength(10);
    expect(dcf.sensitivityGrid).toHaveLength(5);
    expect(dcf.sensitivityGrid[0].values).toHaveLength(5);
    expect(typeof dcf.valuation.impliedMarketGrowthPct).toBe('number');
    const csv = exportDcfToCsv(dcf);
    expect(csv).toContain('Year,CalendarYear,RevGrowthPct');
  });

  it('computes technical indicators, headline-check audit, and 10 University chapters', () => {
    const tech = computeTechnicals('NVDA', 'above_sma200');
    expect(tech.bars.length).toBeGreaterThan(100);
    expect(tech.signalStudy.occurrences).toBeGreaterThan(0);

    const hc = analyzeHeadlineCheck(SAMPLE_HEADLINE_TRACKS.dotcom_hero.text);
    expect(hc.yearsCount).toBeGreaterThan(20);
    expect(hc.lossFirst.maxDrawdownPct).toBeLessThan(0);

    expect(UNIVERSITY_CHAPTERS).toHaveLength(10);
    const s1 = getUniversityChapter('S1');
    expect(s1?.quiz).toHaveLength(3);
  });
});

describe('Invite-Only Account Admission, Single-Use Tokens, Revocation & Audit Logging', () => {
  const testEmails = [
    'test-invite-user@quantgpt.local',
    'test-revoked-user@quantgpt.local',
    'test-expired-user@quantgpt.local',
  ];

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
    await prisma.accountInvitation.deleteMany({ where: { email: { in: testEmails } } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
    await prisma.accountInvitation.deleteMany({ where: { email: { in: testEmails } } });
  });

  it('issues a single-use invitation, validates it, registers the user once, and blocks reuse', async () => {
    const created = await createInvitation({
      email: 'test-invite-user@quantgpt.local',
      role: 'MEMBER',
      expiresInDays: 2,
    });

    expect(created.token).toBeTruthy();
    expect(created.invitation.tokenHash).not.toBe(created.token);

    const check1 = await inspectInvitationToken(created.token);
    expect(check1.status).toBe('pending');
    expect(check1.email).toBe('test-invite-user@quantgpt.local');

    // Wrong email should fail
    await expect(
      acceptInvitationAndRegister({
        token: created.token,
        email: 'wrong-email@quantgpt.local',
        name: 'Wrong User',
        password: 'ValidPassword123!',
      })
    ).rejects.toThrow(/bound to/i);

    // Valid registration succeeds
    const user = await acceptInvitationAndRegister({
      token: created.token,
      email: 'test-invite-user@quantgpt.local',
      name: 'Test Operator',
      password: 'ValidPassword123!',
    });
    expect(user.email).toBe('test-invite-user@quantgpt.local');
    expect(user.role).toBe('MEMBER');

    // Second attempt with the same single-use token must fail
    await expect(
      acceptInvitationAndRegister({
        token: created.token,
        email: 'test-invite-user@quantgpt.local',
        name: 'Replay Attacker',
        password: 'ValidPassword123!',
      })
    ).rejects.toThrow(/already been redeemed/i);
  });

  it('blocks revoked and expired invitation tokens and records audit logs', async () => {
    const revInvite = await createInvitation({
      email: 'test-revoked-user@quantgpt.local',
      role: 'MEMBER',
      expiresInDays: 1,
    });

    await revokeInvitation(revInvite.invitation.id);

    const inspectedRev = await inspectInvitationToken(revInvite.token);
    expect(inspectedRev.status).toBe('revoked');

    // Expired invitation check using inspectInvitationToken with future timestamp
    const expInvite = await createInvitation({
      email: 'test-expired-user@quantgpt.local',
      role: 'MEMBER',
      expiresInDays: 1,
    });
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const inspectedExp = await inspectInvitationToken(expInvite.token, futureDate);
    expect(inspectedExp.status).toBe('expired');

    const logs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: ['INVITATION_CREATED', 'INVITATION_ACCEPTED', 'INVITATION_REVOKED'],
        },
      },
    });
    expect(logs.length).toBeGreaterThanOrEqual(3);
  });
});
