import React from 'react';
import { Bus, Map, GitFork, MapPin, Users, Activity, Bell, Radio, Database } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  stats,
  isConnected,
  alerts,
  onOpenAlerts
}) {
  const activeAlertsCount = alerts?.length || 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
              <Bus className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">CampusMove</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Live GPS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Campus Transport Tracking & Fleet Control</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'map'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Live Map</span>
            </button>

            <button
              onClick={() => setActiveTab('passenger')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'passenger'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student View</span>
            </button>

            <button
              onClick={() => setActiveTab('buses')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'buses'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span className="hidden md:inline">Manage</span>
              <span>Buses</span>
            </button>

            <button
              onClick={() => setActiveTab('routes')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'routes'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GitFork className="w-4 h-4" />
              <span className="hidden md:inline">Manage</span>
              <span>Routes</span>
            </button>

            <button
              onClick={() => setActiveTab('stops')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'stops'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden md:inline">Manage</span>
              <span>Stops</span>
            </button>
          </nav>

          {/* Right Status Badges & Alerts */}
          <div className="flex items-center space-x-3">
            {/* Live Socket Status */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
              title={isConnected ? 'Connected to Live Dispatch Gateway' : 'Connecting to gateway...'}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
              <span className="hidden sm:inline">{isConnected ? 'LIVE FEED' : 'OFFLINE'}</span>
            </div>

            {/* DB Status Badge */}
            <div
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs text-slate-400 bg-slate-800/80 border border-slate-700"
              title={stats?.system?.type || 'Database Engine'}
            >
              <Database className="w-3 h-3 text-slate-400" />
              <span>{stats?.system?.fallbackMode ? 'Memory DB' : 'MongoDB'}</span>
            </div>

            {/* Alerts Bell */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Campus Transport Announcements"
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-900 font-bold text-[10px] rounded-full flex items-center justify-center">
                  {activeAlertsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
