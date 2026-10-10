import React, { useState } from 'react';
import { MapPin, Plus, Search, Edit, Trash2, ShieldCheck, ShieldAlert, GitFork, Compass } from 'lucide-react';

export default function StopManager({
  stops = [],
  routes = [],
  onCreateStop,
  onUpdateStop,
  onDeleteStop,
  onViewStopOnMap
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    lat: 37.4285,
    lng: -122.1695,
    hasShelter: true,
    landmark: '',
    description: ''
  });

  const openCreateModal = () => {
    setEditingStop(null);
    setFormData({
      name: '',
      code: '',
      lat: 37.4285,
      lng: -122.1695,
      hasShelter: true,
      landmark: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (stop) => {
    setEditingStop(stop);
    setFormData({
      name: stop.name,
      code: stop.code,
      lat: stop.lat,
      lng: stop.lng,
      hasShelter: stop.hasShelter !== undefined ? stop.hasShelter : true,
      landmark: stop.landmark || '',
      description: stop.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.lat || !formData.lng) {
      alert('Please fill in stop name, code, latitude and longitude.');
      return;
    }

    const payload = {
      ...formData,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng)
    };

    if (editingStop) {
      onUpdateStop(editingStop._id, payload);
    } else {
      onCreateStop(payload);
    }
    setIsModalOpen(false);
  };

  const filteredStops = stops.filter(stop =>
    stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stop.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stop.landmark && stop.landmark.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <MapPin className="w-6 h-6 text-emerald-400" />
            <span>Campus Bus Stops Directory</span>
          </h1>
          <p className="text-sm text-slate-400">
            Manage passenger pickup stations, GPS coordinates, landmarks, and weather shelters.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stop</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stops by name, code, or landmark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-semibold">{filteredStops.length}</span> of {stops.length} stops
        </div>
      </div>

      {/* STOPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStops.map(stop => {
          // Find routes that stop here
          const connectedRoutes = routes.filter(r =>
            (r.stops || []).some(s => (s.stopId?._id || s.stopId) === stop._id)
          );

          return (
            <div
              key={stop._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shadow">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">{stop.name}</h3>
                      <span className="text-xs font-mono font-bold text-indigo-400">{stop.code}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                      stop.hasShelter
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {stop.hasShelter ? 'Sheltered' : 'Open Air'}
                  </span>
                </div>

                <div className="py-3 text-xs text-slate-400 space-y-2">
                  <p>{stop.description || 'Campus transport passenger station.'}</p>

                  <div className="flex items-center space-x-2 text-slate-300">
                    <Compass className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-[11px] text-slate-400">
                      {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                    </span>
                  </div>

                  {stop.landmark && (
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-500">Landmark:</span> {stop.landmark}
                    </div>
                  )}
                </div>

                {/* Connected Routes Tags */}
                <div className="pt-2 pb-1 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center space-x-1">
                    <GitFork className="w-3 h-3 text-slate-500" />
                    <span>Connected Lines ({connectedRoutes.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {connectedRoutes.length > 0 ? (
                      connectedRoutes.map(r => (
                        <span
                          key={r._id}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white shadow-sm"
                          style={{ backgroundColor: r.color || '#3B82F6' }}
                        >
                          {r.code}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No routes passing</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onViewStopOnMap(stop._id)}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Locate on Map
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(stop)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Stop"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete stop "${stop.name}"? It will also be removed from any routes.`)) {
                        onDeleteStop(stop._id);
                      }
                    }}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete Stop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT STOP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingStop ? `Edit Stop: ${editingStop.name}` : 'Create Campus Stop'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quad Central Plaza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Stop Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ST-QUAD"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Campus Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Near Science Building A, Clock Tower"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Passenger shelter, accessible ramp details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="hasShelter"
                  checked={formData.hasShelter}
                  onChange={(e) => setFormData({ ...formData, hasShelter: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
                />
                <label htmlFor="hasShelter" className="text-xs text-slate-300">
                  Has Weather Shelter & Seating Bench
                </label>
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
                  {editingStop ? 'Save Stop Changes' : 'Create Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
