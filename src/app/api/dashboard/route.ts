import { NextResponse } from 'next/server';
import { getDashboardMetrics, resetDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to get dashboard metrics:', error);
    return NextResponse.json({ error: 'Failed to get dashboard metrics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === 'reset') {
      await resetDatabase();
      const metrics = await getDashboardMetrics();
      return NextResponse.json({ success: true, metrics });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Dashboard action failed:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
