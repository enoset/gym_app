'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Workout } from '@/lib/types';

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [resting, setResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [weights, setWeights] = useState<Record<string, number | null>>({});

  // Load workout
  useEffect(() => {
    fetch(`/api/workouts/${params.id}`)
      .then((r) => r.json())
      .then((data: Workout) => {
        setWorkout(data);
        setCurrentRound(data.currentRound || 1);
        // Pre-fill weights from suggested weights
        const w: Record<string, number | null> = {};
        data.exercises.forEach((e) => {
          w[e.exerciseId] = e.suggestedWeight;
        });
        setWeights(w);
      });
  }, [params.id]);

  // Countdown timer
  useEffect(() => {
    if (!timerRunning || restTime <= 0) return;
    const interval = setInterval(() => {
      setRestTime((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          setResting(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, restTime]);

  const startRest = useCallback((seconds: number) => {
    setRestTime(seconds);
    setResting(true);
    setTimerRunning(true);
  }, []);

  const skipRest = () => {
    setRestTime(0);
    setResting(false);
    setTimerRunning(false);
  };

  async function saveToServer(updated: Workout) {
    await fetch(`/api/workouts/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }

  function buildUpdatedWorkout(): Workout {
    if (!workout) throw new Error('No workout');
    return {
      ...workout,
      currentRound,
      exercises: workout.exercises.map((e) => ({
        ...e,
        weight: weights[e.exerciseId] ?? e.weight,
      })),
    };
  }

  function completeExercise() {
    if (!workout) return;

    if (currentExIdx < workout.exercises.length - 1) {
      // More exercises in this round
      setCurrentExIdx((i) => i + 1);
      startRest(workout.restBetweenExercises);
    } else if (currentRound < workout.rounds) {
      // Round complete, more rounds to go
      setCurrentRound((r) => r + 1);
      setCurrentExIdx(0);
      startRest(workout.restBetweenRounds);
    } else {
      // Workout complete
      const updated = {
        ...buildUpdatedWorkout(),
        completed: true,
        currentRound,
      };
      setWorkout(updated);
      saveToServer(updated);
    }
  }

  function finishEarly() {
    if (!workout) return;
    const updated = { ...buildUpdatedWorkout(), completed: true };
    saveToServer(updated);
    router.push('/history');
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!workout) {
    return <div className="center mt-16">Loading...</div>;
  }

  // --- Completed view ---
  if (workout.completed) {
    return (
      <div>
        <div className="nav">
          <a href="/">Home</a>
          <a href="/history">History</a>
        </div>
        <h1>Workout Complete!</h1>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="badge">{workout.goalLabel}</span>
            <span className="small muted">
              {new Date(workout.date).toLocaleDateString()}
            </span>
          </div>
          {workout.exercises.map((e, i) => (
            <div key={i} className="exercise-row">
              <span>{e.name}</span>
              <span className="muted">
                {e.weight ? `${e.weight} kg` : '—'} &times; {e.reps}
              </span>
            </div>
          ))}
          <p className="mt-16 small" style={{ color: '#06d6a0' }}>
            {workout.rounds} rounds &bull; {workout.exercises.length} exercises
          </p>
        </div>
        <button className="btn-primary" onClick={() => router.push('/')}>
          New Workout
        </button>
      </div>
    );
  }

  // --- Rest timer view ---
  if (resting) {
    const isRoundRest = currentExIdx === 0 && currentRound > 1;
    const nextExercise = workout.exercises[currentExIdx];
    return (
      <div>
        <h2 className="center" style={{ marginTop: 40 }}>
          {isRoundRest ? `Rest Before Round ${currentRound}` : 'Rest'}
        </h2>
        <div className="timer-display">{formatTime(restTime)}</div>
        <p className="center muted mb-16">
          {isRoundRest ? 'Longer rest between rounds' : 'Short rest between exercises'}
        </p>
        {nextExercise && (
          <p className="center mb-24">
            Next: <strong>{nextExercise.name}</strong>
          </p>
        )}
        <button className="btn-secondary" onClick={skipRest}>
          Skip Rest
        </button>
      </div>
    );
  }

  // --- Active exercise view ---
  const current = workout.exercises[currentExIdx];
  const progress = ((currentRound - 1) * workout.exercises.length + currentExIdx) /
    (workout.rounds * workout.exercises.length);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="badge">{workout.goalLabel}</span>
        <span className="small muted">
          Round {currentRound}/{workout.rounds}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#3a3a5c', borderRadius: 4, height: 6, marginBottom: 16 }}>
        <div style={{ background: '#4361ee', borderRadius: 4, height: 6, width: `${progress * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <p className="small muted mb-8">
        Exercise {currentExIdx + 1} of {workout.exercises.length}
      </p>

      {/* Current exercise card */}
      <div className="card center">
        <h2 style={{ marginBottom: 16 }}>{current.name}</h2>
        <p style={{ fontSize: 40, fontWeight: 700, marginBottom: 8 }}>
          {current.reps} reps
        </p>

        <div className="mt-16 mb-16">
          <label className="small muted" style={{ display: 'block', marginBottom: 8 }}>
            Weight (kg)
            {current.suggestedWeight !== null && (
              <span> &mdash; last used: {current.suggestedWeight} kg</span>
            )}
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={weights[current.exerciseId] ?? ''}
            onChange={(e) =>
              setWeights((prev) => ({
                ...prev,
                [current.exerciseId]: e.target.value ? parseFloat(e.target.value) : null,
              }))
            }
            placeholder="kg"
            step="0.5"
            min="0"
          />
        </div>

        <button className="btn-success" onClick={completeExercise}>
          Done
        </button>
      </div>

      {/* Exercise list for this round */}
      <div className="mt-16">
        <h3 className="muted mb-8">
          Circuit ({workout.exercises.length} exercises)
        </h3>
        {workout.exercises.map((e, i) => {
          let cls = 'exercise-row';
          if (i < currentExIdx) cls += ' exercise-done';
          if (i === currentExIdx) cls += ' exercise-current';
          return (
            <div key={i} className={cls}>
              <span>
                {i === currentExIdx && '▶ '}
                {e.name}
              </span>
              <span className="small muted">{e.reps} reps</span>
            </div>
          );
        })}
      </div>

      <button className="btn-secondary" style={{ marginTop: 24 }} onClick={finishEarly}>
        Finish Early &amp; Save
      </button>
    </div>
  );
}
