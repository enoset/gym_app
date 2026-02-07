'use client';

import { useEffect, useState } from 'react';
import { Workout } from '@/lib/types';
import { getHistory, deleteWorkout } from '@/lib/storage';

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getHistory().then((history) => {
      setWorkouts([...history.workouts].reverse());
      setLoaded(true);
    });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this workout?')) return;
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

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
        <div key={w.id} className="card">
          <a href={`/workout?id=${w.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="badge">{w.goalLabel}</span>
              <span style={{ color: w.completed ? '#06d6a0' : '#f72585', fontSize: 11 }}>
                {w.completed ? 'Completed' : 'Incomplete'}
              </span>
            </div>
            <p className="small muted" style={{ marginBottom: 4 }}>
              {new Date(w.date).toLocaleDateString()} at{' '}
              {new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
                {w.exercises.map((e, i) => (
                  <img
                    key={i}
                    src={`/exercises/${e.exerciseId}.png`}
                    alt={e.name}
                    title={e.name}
                    style={{ width: 28, height: 28, borderRadius: 5 }}
                  />
                ))}
              </div>
              <button
                onClick={(ev) => { ev.preventDefault(); handleDelete(w.id); }}
                style={{
                  padding: '8px 20px',
                  fontSize: 14,
                  background: '#c62828',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  width: 'auto',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                Delete
              </button>
            </div>
            <p className="small muted" style={{ marginTop: 4 }}>
              {w.rounds} rounds &bull; {w.exercises.length} exercises &bull; {w.exercises[0]?.reps} reps
            </p>
            {w.exercises.some((e) => e.weight) && (
              <p className="small muted" style={{ marginTop: 4 }}>
                Weights: {w.exercises.filter((e) => e.weight).map((e) => `${e.name}: ${e.weight} lbs`).join(', ')}
              </p>
            )}
          </a>
        </div>
      ))}
    </div>
  );
}
