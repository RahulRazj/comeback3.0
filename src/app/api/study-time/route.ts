import { NextResponse } from 'next/server';
import { logStudyTime, getReviewHistory } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const minutes = Number(body.minutes) || 25;
    await logStudyTime(minutes);
    return NextResponse.json({ success: true, loggedMinutes: minutes });
  } catch (error) {
    console.error('Failed to log study time:', error);
    return NextResponse.json({ error: 'Failed to log study time' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const history = await getReviewHistory(30);
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Failed to get review history:', error);
    return NextResponse.json({ error: 'Failed to get review history' }, { status: 500 });
  }
}
