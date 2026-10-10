import React, { useState } from 'react';
import { GitFork, Plus, Edit, Trash2, Clock, MapPin, Bus, ArrowRight, ArrowDown, CheckCircle, ShieldAlert } from 'lucide-react';

export default function RouteManager({
  routes = [],
  stops = [],
  buses = [],
  onCreateRoute,
  onUpdateRoute,
  onDeleteRoute,
  onViewRouteOnMap
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    color: '#2563EB',
    description: '',
    selectedStopIds: [],
    startTime: '07:00 AM',
    endTime: '11:00 PM',
    frequencyMinutes: 10,
    status: 'ACTIVE'
  });

  const stopMap = new Map(stops.map(s => [s._id, s]));

  const openCreateModal = () => {
    setEditingRoute(null);
    setFormData({
      name: '',
      code: '',
      color: '#2563EB',
      description: '',
      selectedStopIds: stops.slice(0, 4).map(s => s._id),
      startTime: '07:00 AM',
      endTime: '11:00 PM',
      frequencyMinutes: 10,
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (route) => {
    setEditingRoute(route);
    const existingStops = (route.stops || []).map(s => s.stopId?._id || s.stopId);
    setFormData({
      name: route.name,
      code: route.code,
      color: route.color || '#2563EB',
      description: route.description || '',
      selectedStopIds: existingStops,
      startTime: route.schedule?.startTime || '07:00 AM',
      endTime: route.schedule?.endTime || '11:00 PM',
      frequencyMinutes: route.schedule?.frequencyMinutes || 10,
      status: route.status || 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const handleAddStopToSequence = (stopId) => {
    if (!stopId) return;
    setFormData(prev => ({
      ...prev,
      selectedStopIds: [...prev.selectedStopIds, stopId]
    }));
  };

  const handleRemoveStopFromSequence = (index) => {
    setFormData(prev => ({
      ...prev,
      selectedStopIds: prev.selectedStopIds.filter((_, i) => i !== index)
    }));
  };

  const handleMoveStop = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= formData.selectedStopIds.length) return;
    const updated = [...formData.selectedStopIds];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setFormData(prev => ({ ...prev, selectedStopIds: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Route name and code are required');
      return;
    }

    if (formData.selectedStopIds.length < 2) {
      alert('Please add at least 2 stops to define a valid route sequence.');
      return;
    }

    // Generate pathCoordinates automatically connecting selected stop lat/lngs
    const stopCoords = formData.selectedStopIds.map(sId => {
      const sObj = stopMap.get(sId);
      return sObj ? [sObj.lat, sObj.lng] : null;
    }).filter(Boolean);

    // Make loop back to start
    if (stopCoords.length > 0) {
      stopCoords.push(stopCoords[0]);
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      color: formData.color,
      description: formData.description,
      stops: formData.selectedStopIds.map((sId, index) => ({
        stopId: sId,
        order: index + 1,
        stopDurationMin: 2
      })),
      pathCoordinates: editingRoute?.pathCoordinates && editingRoute.pathCoordinates.length > 0
        ? editingRoute.pathCoordinates
        : stopCoords,
      schedule: {
        startTime: formData.startTime,
        endTime: formData.endTime,
        frequencyMinutes: Number(formData.frequencyMinutes) || 10
      },
      status: formData.status
    };

    if (editingRoute) {
      onUpdateRoute(editingRoute._id, payload);
    } else {
      onCreateRoute(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <GitFork className="w-6 h-6 text-indigo-400" />
            <span>Campus Transit Routes</span>
          </h1>
          <p className="text-sm text-slate-400">
            Configure shuttle loop routes, ordered stop sequences, and departure frequencies.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Route</span>
        </button>
      </div>

      {/* ROUTES LIST */}
      <div className="space-y-6">
        {routes.map(route => {
          const assignedBuses = buses.filter(b => (b.routeId?._id || b.routeId) === route._id);
          const stopList = (route.stops || []).map(rs => rs.stop || stopMap.get(rs.stopId?._id || rs.stopId)).filter(Boolean);

          return (
            <div
              key={route._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden"
            >
              {/* Colored Line Accent on Left */}
              <div
                className="absolute left-0 top-0 bottom-0 w-2.5"
                style={{ backgroundColor: route.color || '#3B82F6' }}
              ></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2">
                {/* Route Info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow"
                      style={{ backgroundColor: route.color }}
                    ></span>
                    <h2 className="text-xl font-bold text-white">{route.name}</h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {route.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        route.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {route.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{route.description || 'Standard campus loop shuttle line.'}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                    <span className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{route.schedule?.startTime} - {route.schedule?.endTime}</span>
                    </span>

                    <span className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                      <span>Every {route.schedule?.frequencyMinutes || 15} mins</span>
                    </span>

                    <span className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                      <Bus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{assignedBuses.length} Active Shuttles</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-start lg:self-center">
                  <button
                    onClick={() => onViewRouteOnMap(route._id)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                  >
                    View on Map
                  </button>
                  <button
                    onClick={() => openEditModal(route)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
                    title="Edit Route"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete route "${route.name}"? Active buses on this route will become Idle.`)) {
                        onDeleteRoute(route._id);
                      }
                    }}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700"
                    title="Delete Route"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ROUTE STOP SEQUENCE TIMELINE */}
              <div className="mt-6 pt-5 border-t border-slate-800 pl-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Ordered Stops Sequence ({stopList.length} Stops)
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {stopList.map((stop, sIdx) => (
                    <React.Fragment key={stop._id + '-' + sIdx}>
                      <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-xl shadow-sm">
                        <span
                          className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: route.color || '#3B82F6' }}
                        >
                          {sIdx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">{stop.name}</div>
                          <div className="text-[10px] text-slate-400">{stop.code}</div>
                        </div>
                      </div>

                      {sIdx < stopList.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT ROUTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingRoute ? `Edit Route: ${editingRoute.name}` : 'Create Campus Route'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Route Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gold Line - South Campus Connector"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Route Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RT-GOLD"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-slate-800 border border-slate-700"
                    />
                    <span className="text-xs font-mono text-slate-300">{formData.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Frequency (min)</label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={formData.frequencyMinutes}
                    onChange={(e) => setFormData({ ...formData, frequencyMinutes: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="07:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="11:00 PM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Route details and campus zones covered..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* CONFIGURE STOP SEQUENCE */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase">
                    Stop Sequence ({formData.selectedStopIds.length} stops)
                  </label>

                  <select
                    onChange={(e) => {
                      handleAddStopToSequence(e.target.value);
                      e.target.value = '';
                    }}
                    className="bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
                  >
                    <option value="">+ Add Stop to Route...</option>
                    {stops.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {formData.selectedStopIds.map((sId, idx) => {
                    const stopObj = stopMap.get(sId);
                    return (
                      <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 bg-blue-600 text-white font-bold rounded-full text-[10px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{stopObj?.name || 'Unknown Stop'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({stopObj?.code})</span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleMoveStop(idx, -1)}
                            disabled={idx === 0}
                            className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveStop(idx, 1)}
                            disabled={idx === formData.selectedStopIds.length - 1}
                            className="px-2 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStopFromSequence(idx)}
                            className="px-2 py-0.5 text-xs bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/20 transition-all"
                >
                  {editingRoute ? 'Save Route Changes' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
