import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Array<{ title: string; reason?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ suggestions: typeof suggestions }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then((data) => setSuggestions(data.suggestions))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns.">
    {loading && <p role="status">Loading workout suggestions...</p>}
    {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
    {!loading && !error && suggestions.length === 0 && <p>No workout suggestions available.</p>}
    {!loading && !error && suggestions.length > 0 && <ul>{suggestions.map((suggestion, index) => <li key={index}>{suggestion.title}{suggestion.reason ? ` - ${suggestion.reason}` : ''}</li>)}</ul>}
  </CapabilityCard>;
}
