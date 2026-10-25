import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  const [activities, setActivities] = useState<Array<{ type: string; minutes?: number; points?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ activities: typeof activities }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return <CapabilityCard title="Activities" description="Track student activity minutes and points.">
    {loading && <p role="status">Loading activities...</p>}
    {error && <p role="alert">Unable to load activities: {error}</p>}
    {!loading && !error && activities.length === 0 && <p>No activities recorded.</p>}
    {!loading && !error && activities.length > 0 && <ul>{activities.map((activity, index) => <li key={index}>{activity.type}{activity.minutes ? ` - ${activity.minutes} minutes` : ''}{activity.points ? ` (${activity.points} points)` : ''}</li>)}</ul>}
  </CapabilityCard>;
}
