import type { Topic } from '../types';

export interface BacklogEntry {
  topic: Topic;
  scheduledDate: string;
  daysOverdue: number;
}

export function getBacklog(topics: Topic[], startDate: string, now = new Date()): BacklogEntry[] {
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const startMilliseconds = Date.parse(`${startDate}T00:00:00.000Z`);
  const todayMilliseconds = Date.parse(`${now.toISOString().split('T')[0]}T00:00:00.000Z`);
  if (!Number.isFinite(startMilliseconds)) return [];

  return topics.flatMap((topic) => {
    if (topic.status !== 'pending' && topic.status !== 'in_progress') return [];
    const scheduledMilliseconds = startMilliseconds + (topic.day_target - 1) * dayMilliseconds;
    if (scheduledMilliseconds >= todayMilliseconds) return [];
    return [{
      topic,
      scheduledDate: new Date(scheduledMilliseconds).toISOString().split('T')[0],
      daysOverdue: Math.floor((todayMilliseconds - scheduledMilliseconds) / dayMilliseconds),
    }];
  }).sort((first, second) => second.daysOverdue - first.daysOverdue || first.topic.priority - second.topic.priority);
}