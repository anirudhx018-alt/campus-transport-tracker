import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Activity, Users, Bus } from 'lucide-react';

export default function SimulationToolbar({
  simulationStatus,
  stats,
  onStart,
  onPause,
  onSetSpeed,
  onReset
}) {
  const isRunning = simulationStatus?.isRunning;
  const speed = simulationStatus?.speedMultiplier || 1;

  const speeds = [1, 2, 5, 10];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center space-x-4 max-w-2xl w-[92%] sm:w-auto text-white">
      {/* Simulation Play / Pause */}
      <div className="flex items-center space-x-2 border-r border-slate-800 pr-4">
        {isRunning ? (
          <button
            onClick={onPause}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
            title="Pause GPS Movement Simulation"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause GPS</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all"
            title="Resume GPS Movement Simulation"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run GPS</span>
          </button>
        )}

        <button
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          title="Reset Buses to Route Start Points"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Multiplier Selectors */}
      <div className="flex items-center space-x-1 border-r border-slate-800 pr-4">
        <span className="text-[11px] text-slate-400 font-semibold mr-1 hidden sm:inline">Speed:</span>
        {speeds.map(s => (
          <button
            key={s}
            onClick={() => onSetSpeed(s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              speed === s
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Live Fleet Statistics Ticker */}
      <div className="hidden md:flex items-center space-x-4 text-xs text-slate-300">
        <div className="flex items-center space-x-1.5">
          <Bus className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <strong className="text-white">{stats?.fleet?.activeBuses ?? 0}</strong> active
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>
            <strong className="text-white">{stats?.fleet?.totalPassengers ?? 0}</strong> riders
          </span>
        </div>
      </div>
    </div>
  );
}
