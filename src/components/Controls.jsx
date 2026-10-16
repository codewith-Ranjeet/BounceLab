import React from "react";

export function Controls({
  gravityY,
  setGravityY,
  restitution,
  setRestitution,
  spawnMass,
  setSpawnMass,
  onSpawnBatch,
  onClear,
}) {
  return (
    <div className="flex flex-wrap gap-6 mb-4 p-4 bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
      <label className="flex flex-col text-xs font-semibold">
        Gravity: {gravityY} px/s²
        <input
          type="range"
          min="0"
          max="2500"
          value={gravityY}
          onChange={(e) => setGravityY(Number(e.target.value))}
          className="mt-1"
        />
      </label>

      <label className="flex flex-col text-xs font-semibold">
        Bounciness (Restitution): {restitution}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={restitution}
          onChange={(e) => setRestitution(Number(e.target.value))}
          className="mt-1"
        />
      </label>

      <label className="flex flex-col text-xs font-semibold">
        Ball Mass: {spawnMass} kg
        <input
          type="range"
          min="0.5"
          max="15"
          step="0.5"
          value={spawnMass}
          onChange={(e) => setSpawnMass(Number(e.target.value))}
          className="mt-1"
        />
      </label>

      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={onSpawnBatch}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition"
        >
          Spawn Batch
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded text-xs font-bold transition"
        >
          Clear
        </button>
      </div>
    </div>
  );
}