import React, { useState } from 'react';
import { Bus, MapPin, Clock, Users, ArrowRight, ShieldCheck, Search, Sparkles, Navigation, Calendar } from 'lucide-react';

export default function PassengerView({
  stops = [],
  routes = [],
  buses = [],
  onTrackBusOnMap
}) {
  const [selectedOrigin, setSelectedOrigin] = useState(stops[0]?._id || '');
  const [selectedDestination, setSelectedDestination] = useState(stops[2]?._id || '');
  const [activeStopBoard, setActiveStopBoard] = useState(stops[0]?._id || '');

  const stopMap = new Map(stops.map(s => [s._id, s]));

  // Find routes that connect origin to destination
  const matchedRoutes = routes.filter(route => {
    if (!selectedOrigin || !selectedDestination || selectedOrigin === selectedDestination) return false;
    const stopIds = (route.stops || []).map(s => s.stopId?._id || s.stopId);
    const originIdx = stopIds.indexOf(selectedOrigin);
    const destIdx = stopIds.indexOf(selectedDestination);
    return originIdx !== -1 && destIdx !== -1 && originIdx < destIdx;
  });

  // Incoming buses for the chosen station board
  const stationBuses = buses.filter(b =>
    b.status !== 'MAINTENANCE' && b.status !== 'IDLE' && b.nextStopId === activeStopBoard
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Commuter Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Where is your next campus shuttle?
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Real-time GPS tracking, next bus countdowns, and live seat capacity for university students, faculty, and campus visitors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: TRIP FINDER */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-blue-400" />
              <span>Campus Route Finder</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Starting Stop</label>
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {stops.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={() => {
                    const temp = selectedOrigin;
                    setSelectedOrigin(selectedDestination);
                    setSelectedDestination(temp);
                  }}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                  title="Swap Stops"
                >
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Destination Stop</label>
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {stops.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DIRECT CONNECTING ROUTES RESULTS */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Available Direct Shuttles
              </h3>

              {matchedRoutes.length === 0 ? (
                <div className="text-xs text-slate-400 bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-center">
                  No direct loop shuttle connects these two stops directly in this sequence. Try reversing or select another campus interchange.
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedRoutes.map(route => {
                    const routeBuses = buses.filter(b => (b.routeId?._id || b.routeId) === route._id && b.status !== 'MAINTENANCE');
                    const nextBus = routeBuses[0];

                    return (
                      <div
                        key={route._id}
                        className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: route.color }}
                            ></span>
                            <span className="font-bold text-sm text-white">{route.name}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Every {route.schedule?.frequencyMinutes}m
                          </span>
                        </div>

                        {nextBus ? (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-xs">
                            <div className="flex items-center space-x-1.5 text-slate-300">
                              <Bus className="w-3.5 h-3.5 text-blue-400" />
                              <span>Bus {nextBus.busNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-emerald-400 font-bold">{nextBus.etaMinutes || 2} min away</span>
                              <button
                                onClick={() => onTrackBusOnMap(nextBus._id)}
                                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                              >
                                Track →
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/50">
                            No active shuttle en route right now. Next run according to schedule.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STATION ARRIVAL COUNTDOWN BOARD */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>Station Live Countdown Board</span>
                </h2>
                <p className="text-xs text-slate-400">Live ETA countdown for incoming campus shuttles</p>
              </div>

              {/* Station selector */}
              <select
                value={activeStopBoard}
                onChange={(e) => setActiveStopBoard(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
              >
                {stops.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            {/* Selected Station Banner */}
            {stopMap.has(activeStopBoard) && (
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-white">{stopMap.get(activeStopBoard).name}</div>
                  <div className="text-xs text-slate-400">
                    {stopMap.get(activeStopBoard).landmark || 'Campus Stop'} •{' '}
                    {stopMap.get(activeStopBoard).hasShelter ? 'Sheltered' : 'Open Air'}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-800 text-indigo-400 rounded-lg border border-slate-700">
                    {stopMap.get(activeStopBoard).code}
                  </span>
                </div>
              </div>
            )}

            {/* LIVE ARRIVALS BOARD */}
            <div className="space-y-3">
              {stationBuses.length === 0 ? (
                <div className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-8 text-center">
                  <Bus className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-300">No approaching shuttles at this moment</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Buses are navigating previous stations on their loops. Check the Live Map for whole-fleet overview.
                  </p>
                </div>
              ) : (
                stationBuses.map(bus => {
                  const occupancy = bus.currentOccupancy || 0;
                  const cap = bus.capacity || 40;
                  const ratio = occupancy / cap;
                  const crowdText = ratio > 0.85 ? 'Crowded' : ratio > 0.5 ? 'Moderate' : 'Light (Plenty of seats)';
                  const crowdColor = ratio > 0.85 ? 'text-rose-400' : ratio > 0.5 ? 'text-amber-400' : 'text-emerald-400';

                  return (
                    <div
                      key={bus._id}
                      className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md font-bold"
                          style={{ backgroundColor: bus.routeId?.color || '#3B82F6' }}
                        >
                          <Bus className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-base">{bus.busNumber}</span>
                            <span className="text-xs text-slate-400">({bus.routeId?.name})</span>
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3.5 h-3.5" />
                              <span className={crowdColor}>{crowdText}</span>
                            </span>
                            <span>•</span>
                            <span>{occupancy} / {cap} seats</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60">
                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-400 tracking-tight">
                            {bus.etaMinutes || 1} <span className="text-xs font-normal text-slate-400">min</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {bus.currentLocation?.speed || 0} km/h
                          </div>
                        </div>

                        <button
                          onClick={() => onTrackBusOnMap(bus._id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all shadow"
                        >
                          Track
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ROUTE TIMETABLE SUMMARY */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Operating Timetable</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {routes.map(r => (
                  <div key={r._id} className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }}></span>
                      <span className="font-bold text-xs text-white truncate">{r.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{r.schedule?.startTime} - {r.schedule?.endTime}</div>
                    <div className="text-[10px] text-blue-400 font-medium mt-1">Every {r.schedule?.frequencyMinutes}m</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
