import React, { useState } from 'react';
import { Bell, Plus, Trash2, AlertTriangle, Info, AlertOctagon, Clock } from 'lucide-react';

export default function AlertsModal({
  isOpen,
  onClose,
  alerts = [],
  routes = [],
  onCreateAlert,
  onDeleteAlert
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO',
    routeId: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      alert('Please fill in alert title and message.');
      return;
    }

    onCreateAlert({
      ...formData,
      routeId: formData.routeId || null
    });

    setFormData({ title: '', message: '', type: 'INFO', routeId: '' });
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shadow">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Campus Transport Broadcasts</h2>
              <p className="text-xs text-slate-400">Live service advisories, weather delays, and announcements</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Create Alert Toggle */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast New Campus Advisory</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">New Advisory Notice</h3>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Quad Road Resurfacing Delay"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Advisory Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="INFO">Informational (Blue)</option>
                    <option value="WARNING">Warning (Amber)</option>
                    <option value="DELAY">Traffic Delay (Orange)</option>
                    <option value="EMERGENCY">Emergency (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Applies To Route</label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Campus Lines</option>
                    {routes.map(r => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Message Content</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Details for students and shuttle operators..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Send Broadcast
              </button>
            </form>
          )}

          {/* List of active alerts */}
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No active service advisories. All campus transit operations normal.
              </div>
            ) : (
              alerts.map(alert => {
                const isEmergency = alert.type === 'EMERGENCY';
                const isWarning = alert.type === 'WARNING' || alert.type === 'DELAY';

                return (
                  <div
                    key={alert._id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-md ${
                      isEmergency
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                        : 'bg-blue-950/30 border-blue-500/40 text-blue-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {isEmergency ? (
                          <AlertOctagon className="w-5 h-5 text-rose-400" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-white leading-tight">{alert.title}</h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                              isEmergency
                                ? 'bg-rose-500 text-white'
                                : isWarning
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            {alert.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{alert.message}</p>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-1 pt-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteAlert(alert._id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors"
                      title="Dismiss Advisory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
