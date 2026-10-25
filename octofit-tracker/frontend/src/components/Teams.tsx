import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  const [teams, setTeams] = useState<Array<{ name: string; members?: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ teams: typeof teams }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return <CapabilityCard title="Teams" description="Manage teams and members.">
    {loading && <p role="status">Loading teams...</p>}
    {error && <p role="alert">Unable to load teams: {error}</p>}
    {!loading && !error && teams.length === 0 && <p>No teams available.</p>}
    {!loading && !error && teams.length > 0 && <ul>{teams.map((team, index) => <li key={index}>{team.name}{team.members?.length ? ` (${team.members.length} members)` : ''}</li>)}</ul>}
  </CapabilityCard>;
}
