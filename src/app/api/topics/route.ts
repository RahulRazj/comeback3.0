import { NextResponse } from 'next/server';
import { getTopics, createTopic } from '@/lib/db';
import { PillarType, TopicStatus, Difficulty } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pillar = searchParams.get('pillar') as PillarType | null;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') as TopicStatus | null;
    const difficulty = searchParams.get('difficulty') as Difficulty | null;
    const search = searchParams.get('search') || undefined;
    const dueOnly = searchParams.get('dueOnly') === 'true';

    const topics = await getTopics({
      pillar: pillar || undefined,
      category,
      status: status || undefined,
      difficulty: difficulty || undefined,
      search,
      dueOnly,
    });

    return NextResponse.json({ topics, count: topics.length });
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.pillar || !body.category) {
      return NextResponse.json({ error: 'Title, pillar, and category are required' }, { status: 400 });
    }

    const created = await createTopic(body);
    return NextResponse.json({ topic: created }, { status: 201 });
  } catch (error) {
    console.error('Failed to create topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
