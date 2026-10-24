import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  let board = await prisma.teamBoard.findFirst({
    include: { cards: { orderBy: { updatedAt: 'desc' } } },
  });

  if (!board) {
    board = await prisma.teamBoard.create({
      data: {
        name: 'Alpha Desk Shared Research',
        seatsJson: JSON.stringify([
          { seat: 1, role: 'Lead Quant', status: 'Active' },
          { seat: 2, role: 'Risk Skeptic', status: 'Invite Open' },
          { seat: 3, role: 'Macro Analyst', status: 'Invite Open' },
        ]),
      },
      include: { cards: true },
    });
  }

  return NextResponse.json({
    board: {
      ...board,
      seats: JSON.parse(board.seatsJson || '[]'),
      files: JSON.parse(board.filesJson || '[]'),
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  let board = await prisma.teamBoard.findFirst();
  if (!board) {
    board = await prisma.teamBoard.create({ data: { name: 'Alpha Desk Shared Research' } });
  }

  if (body.action === 'move' && body.cardId && body.column) {
    const card = await prisma.teamCard.update({
      where: { id: String(body.cardId) },
      data: { column: String(body.column) },
    });
    return NextResponse.json({ ok: true, card });
  }

  const card = await prisma.teamCard.create({
    data: {
      boardId: board.id,
      column: String(body.column || 'NOTES'),
      title: String(body.title || 'New Hypothesis'),
      note: String(body.note || ''),
      finding: body.finding ? String(body.finding) : null,
      cagr: body.cagr !== undefined ? Number(body.cagr) : null,
      sharpe: body.sharpe !== undefined ? Number(body.sharpe) : null,
      maxDrawdown: body.maxDrawdown !== undefined ? Number(body.maxDrawdown) : null,
      author: String(body.author || 'Operator'),
    },
  });

  return NextResponse.json({ ok: true, card });
}
