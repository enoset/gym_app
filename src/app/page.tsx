'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkoutGoal } from '@/lib/types';

const goals: { key: WorkoutGoal; label: string; desc: string }[] = [
  { key: 'strength', label: 'Strength', desc: 'Heavy weights, low reps. Build raw strength.' },
  { key: 'muscle_building', label: 'Muscle Building', desc: 'Moderate weights, controlled reps. Hypertrophy focus.' },
  { key: 'fat_loss', label: 'Fat Loss', desc: 'Moderate weights, minimal rest. Max calorie burn.' },
  { key: 'endurance', label: 'Endurance', desc: 'Light weights, high reps. Build stamina.' },
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState<WorkoutGoal | null>(null);

  async function generate(goal: WorkoutGoal) {
    setLoading(goal);
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal }),
      });
      const workout = await res.json();
      router.push(`/workout/${workout.id}`);
    } catch {
      alert('Failed to generate workout');
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="nav">
        <a href="/"><strong>Home</strong></a>
        <a href="/history">History</a>
      </div>

      <h1>Kettlebell Workout</h1>
      <p className="muted mb-24">
        Pick a goal. Get a full-body kettlebell circuit with a fresh exercise combo each time.
      </p>

      {goals.map((g) => (
        <div key={g.key} className="card">
          <h3>{g.label}</h3>
          <p className="small muted mb-12">{g.desc}</p>
          <button
            className="btn-primary"
            onClick={() => generate(g.key)}
            disabled={loading !== null}
          >
            {loading === g.key ? 'Generating...' : `Start ${g.label} Workout`}
          </button>
        </div>
      ))}
    </div>
  );
}
