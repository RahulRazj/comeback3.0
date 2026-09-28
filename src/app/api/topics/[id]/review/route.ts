import { NextResponse } from 'next/server';
import { recordTopicReview } from '@/lib/db';
import { ReviewOutcome } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { confidence, outcome, notes } = body;

    if (confidence === undefined || !outcome) {
      return NextResponse.json(
        { error: 'confidence (1-5) and outcome (remembered|struggled|forgot) are required' },
        { status: 400 }
      );
    }

    const result = await recordTopicReview(
      id,
      Number(confidence),
      outcome as ReviewOutcome,
      notes
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to record review:', error);
    return NextResponse.json({ error: 'Failed to record review' }, { status: 500 });
  }
}
