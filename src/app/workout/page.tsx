'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Workout } from '@/lib/types';
import { getWorkout, updateWorkout } from '@/lib/storage';

const BASE_PATH = '/gym_app';

export default function WorkoutPage() {
  return (
    <Suspense fallback={<div className="center mt-16">Loading...</div>}>
      <WorkoutContent />
    </Suspense>
  );
}

function WorkoutContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
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
    if (!id) return;
    getWorkout(id).then((data) => {
      if (!data) return;
      setWorkout(data);
      setCurrentRound(data.currentRound || 1);
      // Pre-fill weights from suggested weights
      const w: Record<string, number | null> = {};
      data.exercises.forEach((e) => {
        w[e.exerciseId] = e.suggestedWeight;
      });
      setWeights(w);
    });
  }, [id]);

  // Warn before leaving an active workout
  useEffect(() => {
    if (!workout || workout.completed) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    // Push a dummy history entry so back/swipe triggers popstate instead of leaving
    window.history.pushState(null, '', window.location.href);
    const popHandler = () => {
      if (confirm('Leave workout? Your progress will be lost unless you save.')) {
        router.push('/');
      } else {
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', popHandler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('popstate', popHandler);
    };
  }, [workout, router]);

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

  async function saveProgress(updated: Workout) {
    await updateWorkout(updated);
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
      saveProgress(updated);
    }
  }

  function finishEarly() {
    if (!workout) return;
    const updated = { ...buildUpdatedWorkout(), completed: true };
    saveProgress(updated);
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
          <Link href="/">Home</Link>
          <Link href="/history">History</Link>
        </div>
        <h1>Workout Complete!</h1>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="badge">{workout.goalLabel}</span>
            <span className="small muted">
              {new Date(workout.date).toLocaleDateString()}
            </span>
          </div>
          {workout.exercises.map((e, i) => (
            <div key={i} className="exercise-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={`${BASE_PATH}/exercises/${e.exerciseId}.png`}
                alt={e.name}
                style={{ width: 30, height: 30, borderRadius: 5, flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{e.name}</span>
              <span className="muted">
                {e.weight ? `${e.weight} lbs` : '—'} &times; {e.reps}
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
        <h2 className="center" style={{ marginTop: 24 }}>
          {isRoundRest ? `Rest Before Round ${currentRound}` : 'Rest'}
        </h2>
        <div className="timer-display">{formatTime(restTime)}</div>
        <p className="center muted mb-8">
          {isRoundRest ? 'Longer rest between rounds' : 'Short rest between exercises'}
        </p>
        {nextExercise && (
          <div className="center mb-16">
            <img
              src={`${BASE_PATH}/exercises/${nextExercise.exerciseId}.png`}
              alt={nextExercise.name}
              style={{ width: 64, height: 64, borderRadius: 10, marginBottom: 6 }}
            />
            <p>
              Next: <strong>{nextExercise.name}</strong>
            </p>
          </div>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span className="badge">{workout.goalLabel}</span>
        <span className="small muted">
          Round {currentRound}/{workout.rounds}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#333', borderRadius: 4, height: 4, marginBottom: 10 }}>
        <div style={{ background: '#4361ee', borderRadius: 4, height: 4, width: `${progress * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <p className="small muted mb-8">
        Exercise {currentExIdx + 1} of {workout.exercises.length}
      </p>

      {/* Current exercise card */}
      <div className="card center">
        <img
          src={`${BASE_PATH}/exercises/${current.exerciseId}.png`}
          alt={current.name}
          style={{ width: 80, height: 80, borderRadius: 10, marginBottom: 8 }}
        />
        <h2 style={{ marginBottom: 4 }}>{current.name}</h2>
        <p style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
          {current.reps} reps
        </p>

        <div style={{ margin: '8px 0' }}>
          <label className="small muted" style={{ display: 'block', marginBottom: 4 }}>
            Weight (lbs)
            {current.suggestedWeight !== null && (
              <span> &mdash; last used: {current.suggestedWeight} lbs</span>
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
            placeholder="lbs"
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
            <div key={i} className={cls} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img
                src={`${BASE_PATH}/exercises/${e.exerciseId}.png`}
                alt={e.name}
                style={{ width: 30, height: 30, borderRadius: 5, flexShrink: 0 }}
              />
              <span style={{ flex: 1, fontSize: 14 }}>
                {i === currentExIdx && '▶ '}
                {e.name}
              </span>
              <span className="small muted">{e.reps} reps</span>
            </div>
          );
        })}
      </div>

      <button className="btn-secondary" style={{ marginTop: 12 }} onClick={finishEarly}>
        Finish Early &amp; Save
      </button>
    </div>
  );
}
