import React, { useState } from 'react';
import { Bus, Plus, Search, Filter, Edit, Trash2, Phone, AlertCircle, CheckCircle2, Wrench, Shield, ChevronRight } from 'lucide-react';

export default function FleetManager({
  buses = [],
  routes = [],
  onCreateBus,
  onUpdateBus,
  onDeleteBus,
  onSelectBusOnMap
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    busNumber: '',
    plateNumber: '',
    capacity: 40,
    driverName: '',
    driverPhone: '',
    status: 'ACTIVE',
    routeId: ''
  });

  const openCreateModal = () => {
    setEditingBus(null);
    setFormData({
      busNumber: '',
      plateNumber: '',
      capacity: 40,
      driverName: '',
      driverPhone: '',
      status: 'ACTIVE',
      routeId: routes[0]?._id || ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      plateNumber: bus.plateNumber,
      capacity: bus.capacity || 40,
      driverName: bus.driverName || '',
      driverPhone: bus.driverPhone || '',
      status: bus.status || 'ACTIVE',
      routeId: bus.routeId?._id || bus.routeId || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.busNumber || !formData.plateNumber) {
      alert('Please fill in Bus Number and License Plate.');
      return;
    }

    if (editingBus) {
      onUpdateBus(editingBus._id, formData);
    } else {
      onCreateBus(formData);
    }
    setIsModalOpen(false);
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch =
      bus.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.driverName && bus.driverName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || bus.status === statusFilter;
    const busRouteId = bus.routeId?._id || bus.routeId;
    const matchesRoute = routeFilter === 'ALL' || busRouteId === routeFilter;

    return matchesSearch && matchesStatus && matchesRoute;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER & TOP STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Bus className="w-6 h-6 text-blue-500" />
            <span>Campus Bus Fleet Management</span>
          </h1>
          <p className="text-sm text-slate-400">
            Monitor shuttle assignments, live passenger capacities, and maintenance status.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Bus</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by bus number, plate, or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 text-white pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="STOPPED">Stopped</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="IDLE">Idle</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Route:</span>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none"
            >
              <option value="ALL">All Routes</option>
              {routes.map(r => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BUS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuses.map((bus) => {
          const occupancyPercent = Math.round(((bus.currentOccupancy || 0) / (bus.capacity || 1)) * 100);
          const isMaintenance = bus.status === 'MAINTENANCE';

          return (
            <div
              key={bus._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                      style={{ backgroundColor: bus.routeId?.color || '#2563EB' }}
                    >
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{bus.busNumber}</h3>
                      <p className="text-xs font-mono text-slate-400">{bus.plateNumber}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      bus.status === 'IN_TRANSIT'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : bus.status === 'STOPPED'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : bus.status === 'MAINTENANCE'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {bus.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Route Information */}
                <div className="py-3">
                  <div className="text-xs text-slate-400 mb-1">Assigned Route</div>
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: bus.routeId?.color || '#64748B' }}
                    ></span>
                    <span className="font-semibold text-sm text-slate-200">
                      {bus.routeId?.name || 'Unassigned (Standby)'}
                    </span>
                  </div>
                </div>

                {/* Passenger Capacity Gauge */}
                <div className="py-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>Passenger Load</span>
                    <span className="font-semibold">
                      {bus.currentOccupancy || 0} / {bus.capacity} seats ({occupancyPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
                    <div
                      className={`h-full transition-all duration-300 ${
                        occupancyPercent > 85 ? 'bg-rose-500' : occupancyPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancyPercent)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Driver Details */}
                <div className="pt-3 pb-1 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-slate-400">
                    Driver: <span className="text-slate-200 font-medium">{bus.driverName}</span>
                  </div>
                  {bus.driverPhone && (
                    <a
                      href={`tel:${bus.driverPhone}`}
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{bus.driverPhone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectBusOnMap(bus._id)}
                  className="flex items-center space-x-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Track on Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(bus)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit Bus"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete bus ${bus.busNumber}?`)) {
                        onDeleteBus(bus._id);
                      }
                    }}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Delete Bus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBuses.length === 0 && (
        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800">
          <Bus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No buses found</h3>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or add a new bus to the fleet.</p>
        </div>
      )}

      {/* CREATE / EDIT BUS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingBus ? `Edit Bus: ${editingBus.busNumber}` : 'Register New Campus Bus'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Bus Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SH-401"
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">License Plate</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CP-9921"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Passenger Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="STOPPED">Stopped</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="IDLE">Idle / Standby</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assign Route</label>
                <select
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">No Route Assigned (Standby)</option>
                  {routes.map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Driver Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
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
                  {editingBus ? 'Save Changes' : 'Create Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
