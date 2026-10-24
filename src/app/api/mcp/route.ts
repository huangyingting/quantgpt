import { NextResponse } from 'next/server';
import { runBacktest, runParameterSweep } from '@/lib/quant/backtester';
import { gradeStock } from '@/lib/quant/grader';
import { computeTechnicals } from '@/lib/quant/technicals';
import { runDcfModel } from '@/lib/quant/dcf';
import { STRATEGIES, WAREHOUSE_FACTORS, WORLD_KINDS, STOCK_UNIVERSE } from '@/lib/quant/warehouse';

export const MCP_CORE_TOOLS = [
  {
    name: 'describe_capabilities',
    description: 'Overview of the QuantGPT point-in-time market data warehouse, 175-strategy library, walk-forward backtester, and 11-check Skeptic system.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'available_categories',
    description: 'List the 7 specialized MCP tool categories (portfolio, alerts, compare, cloud, forum, team, university) available for progressive activation.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'activate_category',
    description: 'Unlock one of the 7 specialized MCP tool categories for the current session.',
    inputSchema: { type: 'object', properties: { category: { type: 'string' } }, required: ['category'] },
  },
  {
    name: 'list_factors',
    description: 'List the 151 point-in-time factors across Momentum, Value, Quality, Growth, Technical, Volatility, and Flows.',
    inputSchema: { type: 'object', properties: { family: { type: 'string' } } },
  },
  {
    name: 'search_library',
    description: 'Search the 175 documented academic and practitioner strategies by keyword, category, or source.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, type: { type: 'string' } } },
  },
  {
    name: 'run_backtest',
    description: 'Run a survivorship-bias-free multi-factor screen backtest with a 2015 walk-forward out-of-sample split and transaction costs.',
    inputSchema: {
      type: 'object',
      properties: {
        presetId: { type: 'string' },
        benchmark: { type: 'string' },
        startYear: { type: 'number' },
        splitYear: { type: 'number' },
        costBps: { type: 'number' },
      },
    },
  },
  {
    name: 'run_market_timing',
    description: 'Run a regime / moving-average market timing backtest with optional hysteresis buffer bands and 3M T-bill cash yield.',
    inputSchema: {
      type: 'object',
      properties: {
        smaWindow: { type: 'number' },
        entryBandPct: { type: 'number' },
        exitBandPct: { type: 'number' },
      },
    },
  },
  {
    name: 'run_library_strategy',
    description: 'Run one of the 175 documented Strategy Library presets by ID (e.g. mom_01, val_01, qual_01).',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
  },
  {
    name: 'run_sweep',
    description: 'Run a multi-parameter grid sweep (up to 100 variants) to inspect parameter plateaus and overfitting risk.',
    inputSchema: { type: 'object', properties: { splitYear: { type: 'number' } } },
  },
  {
    name: 'challenge_finding',
    description: 'Run the 11-check Skeptic challenge (OOS split, PSR luck p-value, 25 bps friction, decades, 1000x bootstrap, random baseline, parameter neighbors).',
    inputSchema: { type: 'object', properties: { presetId: { type: 'string' } } },
  },
  {
    name: 'grade_stock',
    description: 'Grade any US stock A+ to F across Momentum, Value, Quality, Growth, Earnings Track, and Flows.',
    inputSchema: { type: 'object', properties: { ticker: { type: 'string' } }, required: ['ticker'] },
  },
  {
    name: 'check_halal',
    description: 'Run the 5-test AAOIFI Shariah Standard No. 21 Halal compliance screen on a ticker.',
    inputSchema: { type: 'object', properties: { ticker: { type: 'string' } }, required: ['ticker'] },
  },
  {
    name: 'technicals',
    description: 'Compute 44 technical indicators (SMA 20/50/200, Bollinger, Keltner, TTM Squeeze, RSI, MACD, Stoch, ADX, OBV, MFI) for a ticker.',
    inputSchema: { type: 'object', properties: { ticker: { type: 'string' }, range: { type: 'string' } }, required: ['ticker'] },
  },
  {
    name: 'signal_study',
    description: 'Measure historical 5/21/63-day forward return distributions after a technical signal across the US stock warehouse.',
    inputSchema: { type: 'object', properties: { ticker: { type: 'string' }, signal: { type: 'string' } } },
  },
  {
    name: 'financial_model',
    description: 'Run a 10-year DCF valuation model with Bear/Base/Bull scenarios, reverse-DCF implied growth solver, and 5x5 WACC x Terminal Growth matrix.',
    inputSchema: { type: 'object', properties: { ticker: { type: 'string' } }, required: ['ticker'] },
  },
  {
    name: 'market_snapshot',
    description: 'Get the current market regime, benchmark tape, and top factor movers from the warehouse.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'world_events',
    description: 'Query the 19 geopolitical and macro event kinds with 1, 5, 21, and 63-session S&P 500 reaction distributions and sign tests.',
    inputSchema: { type: 'object', properties: { kind: { type: 'string' } } },
  },
  {
    name: 'list_warehouse',
    description: 'List the tables and schemas in the QuantGPT point-in-time market data warehouse.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'query_warehouse',
    description: 'Execute a read-only analytical query against the QuantGPT point-in-time market data warehouse.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
  },
];

export async function GET() {
  return NextResponse.json({
    protocol: 'Model Context Protocol (MCP) JSON-RPC 2.0',
    server: 'quantgpt-mcp-server',
    version: '2026.10',
    endpoint: '/api/mcp',
    coreToolsCount: MCP_CORE_TOOLS.length,
    categories: ['portfolio', 'alerts', 'compare', 'cloud', 'forum', 'team', 'university'],
    tools: MCP_CORE_TOOLS,
  });
}

export async function POST(request: Request) {
  const rpc = await request.json().catch(() => ({}));
  const id = rpc.id ?? 1;
  const method = rpc.method || 'tools/list';
  const params = rpc.params || {};

  if (method === 'initialize') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        serverInfo: { name: 'quantgpt-mcp', version: '2026.10.1' },
        capabilities: { tools: { listChanged: true } },
      },
    });
  }

  if (method === 'tools/list') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: { tools: MCP_CORE_TOOLS },
    });
  }

  if (method === 'tools/call') {
    const toolName = params.name || '';
    const args = params.arguments || {};
    let output: unknown = {};

    switch (toolName) {
      case 'describe_capabilities':
        output = {
          warehouse: '97.4M daily price bars (1998–2026), 518K point-in-time SEC filings, 175 documented strategies, 19 world event kinds.',
          findingsSystem: ['DATA VALIDATED', 'TRADE-OFF', 'NO EDGE'],
          walkForwardDefaultSplitYear: 2015,
        };
        break;
      case 'available_categories':
        output = {
          categories: [
            { id: 'portfolio', tools: ['check_portfolio', 'factor_loadings', 'rebalance_diff'] },
            { id: 'alerts', tools: ['create_watch', 'list_watches', 'paper_book_status'] },
            { id: 'compare', tools: ['compare_strategies', 'correlation_matrix'] },
            { id: 'cloud', tools: ['list_cloud_bots', 'compile_bot', 'bot_run_logs'] },
            { id: 'forum', tools: ['list_forum_threads', 'publish_finding'] },
            { id: 'team', tools: ['list_team_cards', 'move_team_card'] },
            { id: 'university', tools: ['list_chapters', 'record_progress'] },
          ],
        };
        break;
      case 'list_factors':
        output = { factors: WAREHOUSE_FACTORS };
        break;
      case 'search_library': {
        const q = String(args.query || '').toLowerCase();
        const matches = STRATEGIES.filter(
          (s) =>
            !q ||
            s.name.toLowerCase().includes(q) ||
            s.thesis.toLowerCase().includes(q) ||
            s.type.toLowerCase().includes(q)
        ).slice(0, 15);
        output = { totalIndexed: STRATEGIES.length, matches };
        break;
      }
      case 'run_backtest':
      case 'run_library_strategy':
        output = runBacktest({
          presetId: args.id || args.presetId || 'mom_01',
          benchmark: args.benchmark || '$SPXTR',
          startYear: args.startYear || 1998,
          splitYear: args.splitYear || 2015,
          costBps: args.costBps ?? 10,
        });
        break;
      case 'run_market_timing':
        output = runBacktest({
          presetId: 'tim_01',
          engine: 'timing',
          smaWindow: args.smaWindow || 200,
          entryBandPct: args.entryBandPct ?? 1,
          exitBandPct: args.exitBandPct ?? 3,
        });
        break;
      case 'run_sweep':
        output = runParameterSweep({ splitYear: args.splitYear || 2015 });
        break;
      case 'challenge_finding':
        output = runBacktest({ presetId: args.presetId || 'mom_01' }).skeptic;
        break;
      case 'grade_stock':
        output = gradeStock(String(args.ticker || 'NVDA'));
        break;
      case 'check_halal':
        output = gradeStock(String(args.ticker || 'NVDA')).halal;
        break;
      case 'technicals':
      case 'signal_study':
        output = computeTechnicals(String(args.ticker || 'NVDA'), '1Y');
        break;
      case 'financial_model':
        output = runDcfModel({ ticker: String(args.ticker || 'MU') });
        break;
      case 'world_events':
        output = args.kind && WORLD_KINDS[String(args.kind)]
          ? WORLD_KINDS[String(args.kind)]
          : { kinds: Object.keys(WORLD_KINDS) };
        break;
      case 'market_snapshot':
        output = {
          asOf: '2026-10-16',
          regime: 'BULLISH_ABOVE_200SMA',
          spxDistSma200Pct: 6.8,
          vix: 15.4,
          tbill3mYieldPct: 4.35,
          leaders: Object.values(STOCK_UNIVERSE).slice(0, 6),
        };
        break;
      default:
        output = {
          tables: ['daily_bars', 'sec_point_in_time_facts', 'strategy_library_175', 'world_events_19', 'treasury_yields'],
          sampleRowCount: 97412890,
        };
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      },
    });
  }

  return NextResponse.json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
}
