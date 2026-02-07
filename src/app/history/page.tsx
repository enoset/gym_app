'use client';

import { useEffect, useState } from 'react';
import { Workout } from '@/lib/types';

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/workouts')
      .then((r) => r.json())
      .then((data) => {
        setWorkouts(data);
        setLoaded(true);
      });
  }, []);

  return (
    <div>
      <div className="nav">
        <a href="/">Home</a>
        <a href="/history"><strong>History</strong></a>
      </div>

      <h1>Workout History</h1>

      {!loaded && <p className="muted">Loading...</p>}

      {loaded && workouts.length === 0 && (
        <p className="muted">No workouts yet. Generate one from the home page!</p>
      )}

      {workouts.map((w) => (
        <a key={w.id} href={`/workout/${w.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className="badge">{w.goalLabel}</span>
              <span style={{ color: w.completed ? '#06d6a0' : '#f72585', fontSize: 12 }}>
                {w.completed ? 'Completed' : 'Incomplete'}
              </span>
            </div>
            <p className="small muted mb-8">
              {new Date(w.date).toLocaleDateString()} at{' '}
              {new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="small">
              {w.exercises.map((e) => e.name).join(' → ')}
            </p>
            <p className="small muted" style={{ marginTop: 4 }}>
              {w.rounds} rounds &bull; {w.exercises.length} exercises &bull; {w.exercises[0]?.reps} reps
            </p>
            {w.exercises.some((e) => e.weight) && (
              <p className="small muted" style={{ marginTop: 4 }}>
                Weights: {w.exercises.filter((e) => e.weight).map((e) => `${e.name}: ${e.weight}kg`).join(', ')}
              </p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
