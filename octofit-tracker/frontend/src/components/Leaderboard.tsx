import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Array<{ teamName: string; totalPoints: number; rank: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ leaderboard: typeof leaderboard }>('/api/leaderboard')
      .then((data) => setLeaderboard(data.leaderboard))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return <CapabilityCard title="Leaderboard" description="Compare team point totals.">
    {loading && <p role="status">Loading leaderboard...</p>}
    {error && <p role="alert">Unable to load leaderboard: {error}</p>}
    {!loading && !error && leaderboard.length === 0 && <p>No leaderboard scores yet.</p>}
    {!loading && !error && leaderboard.length > 0 && <ol>{leaderboard.map((entry) => <li key={entry.rank}>{entry.teamName}: {entry.totalPoints} points</li>)}</ol>}
  </CapabilityCard>;
}
