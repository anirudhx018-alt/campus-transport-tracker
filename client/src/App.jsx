import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import FleetManager from './components/FleetManager';
import RouteManager from './components/RouteManager';
import StopManager from './components/StopManager';
import PassengerView from './components/PassengerView';
import SimulationToolbar from './components/SimulationToolbar';
import AlertsModal from './components/AlertsModal';

import { socket, busAPI, routeAPI, stopAPI, alertAPI, statAPI, simulationAPI } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'passenger', 'buses', 'routes', 'stops'
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [simulationStatus, setSimulationStatus] = useState({ isRunning: true, speedMultiplier: 1 });
  const [isConnected, setIsConnected] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Load initial data via REST
  const refreshAllData = async () => {
    try {
      const [busData, routeData, stopData, alertData, statData, simData] = await Promise.all([
        busAPI.getAll(),
        routeAPI.getAll(),
        stopAPI.getAll(),
        alertAPI.getAll(),
        statAPI.getStats(),
        simulationAPI.getStatus()
      ]);
      setBuses(busData);
      setRoutes(routeData);
      setStops(stopData);
      setAlerts(alertData);
      setStats(statData);
      setSimulationStatus(simData);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();

    // Socket.io real-time listeners
    socket.on('connect', () => {
      console.log('Connected to real-time dispatch server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from dispatch server');
      setIsConnected(false);
    });

    socket.on('initial_state', (data) => {
      if (data.buses) setBuses(data.buses);
      if (data.routes) setRoutes(data.routes);
      if (data.stops) setStops(data.stops);
      if (data.alerts) setAlerts(data.alerts);
      if (data.simulation) setSimulationStatus(data.simulation);
    });

    socket.on('buses_updated', (updatedBuses) => {
      setBuses(updatedBuses);
    });

    socket.on('bus_created', (newBus) => {
      setBuses(prev => [...prev.filter(b => b._id !== newBus._id), newBus]);
    });

    socket.on('bus_updated', (updatedBus) => {
      setBuses(prev => prev.map(b => b._id === updatedBus._id ? updatedBus : b));
    });

    socket.on('bus_deleted', ({ id }) => {
      setBuses(prev => prev.filter(b => b._id !== id));
      if (selectedBusId === id) setSelectedBusId(null);
    });

    socket.on('route_created', (newRoute) => {
      setRoutes(prev => [...prev, newRoute]);
    });

    socket.on('route_updated', (updatedRoute) => {
      setRoutes(prev => prev.map(r => r._id === updatedRoute._id ? updatedRoute : r));
    });

    socket.on('route_deleted', ({ id }) => {
      setRoutes(prev => prev.filter(r => r._id !== id));
    });

    socket.on('stop_created', (newStop) => {
      setStops(prev => [...prev, newStop]);
    });

    socket.on('stop_updated', (updatedStop) => {
      setStops(prev => prev.map(s => s._id === updatedStop._id ? updatedStop : s));
    });

    socket.on('stop_deleted', ({ id }) => {
      setStops(prev => prev.filter(s => s._id !== id));
    });

    socket.on('alert_created', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    socket.on('alert_deleted', ({ id }) => {
      setAlerts(prev => prev.filter(a => a._id !== id));
    });

    socket.on('simulation_status', (status) => {
      setSimulationStatus(status);
    });

    // Periodic stats polling
    const statInterval = setInterval(async () => {
      try {
        const freshStats = await statAPI.getStats();
        setStats(freshStats);
      } catch (err) {
        // ignore background error
      }
    }, 4000);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initial_state');
      socket.off('buses_updated');
      socket.off('bus_created');
      socket.off('bus_updated');
      socket.off('bus_deleted');
      socket.off('route_created');
      socket.off('route_updated');
      socket.off('route_deleted');
      socket.off('stop_created');
      socket.off('stop_updated');
      socket.off('stop_deleted');
      socket.off('alert_created');
      socket.off('alert_deleted');
      socket.off('simulation_status');
      clearInterval(statInterval);
    };
  }, [selectedBusId]);

  // BUS HANDLERS
  const handleCreateBus = async (data) => {
    try {
      await busAPI.create(data);
      refreshAllData();
    } catch (err) {
      alert(`Error creating bus: ${err.message}`);
    }
  };

  const handleUpdateBus = async (id, data) => {
    try {
      await busAPI.update(id, data);
      refreshAllData();
    } catch (err) {
      alert(`Error updating bus: ${err.message}`);
    }
  };

  const handleDeleteBus = async (id) => {
    try {
      await busAPI.delete(id);
      refreshAllData();
    } catch (err) {
      alert(`Error deleting bus: ${err.message}`);
    }
  };

  const handleAssignRoute = async (busId, routeId) => {
    try {
      await busAPI.assignRoute(busId, routeId);
      refreshAllData();
    } catch (err) {
      alert(`Error assigning route: ${err.message}`);
    }
  };

  const handleStatusChange = async (busId, status) => {
    try {
      await busAPI.updateStatus(busId, status);
      refreshAllData();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // ROUTE HANDLERS
  const handleCreateRoute = async (data) => {
    try {
      await routeAPI.create(data);
      refreshAllData();
    } catch (err) {
      alert(`Error creating route: ${err.message}`);
    }
  };

  const handleUpdateRoute = async (id, data) => {
    try {
      await routeAPI.update(id, data);
      refreshAllData();
    } catch (err) {
      alert(`Error updating route: ${err.message}`);
    }
  };

  const handleDeleteRoute = async (id) => {
    try {
      await routeAPI.delete(id);
      refreshAllData();
    } catch (err) {
      alert(`Error deleting route: ${err.message}`);
    }
  };

  // STOP HANDLERS
  const handleCreateStop = async (data) => {
    try {
      await stopAPI.create(data);
      refreshAllData();
    } catch (err) {
      alert(`Error creating stop: ${err.message}`);
    }
  };

  const handleUpdateStop = async (id, data) => {
    try {
      await stopAPI.update(id, data);
      refreshAllData();
    } catch (err) {
      alert(`Error updating stop: ${err.message}`);
    }
  };

  const handleDeleteStop = async (id) => {
    try {
      await stopAPI.delete(id);
      refreshAllData();
    } catch (err) {
      alert(`Error deleting stop: ${err.message}`);
    }
  };

  // ALERT HANDLERS
  const handleCreateAlert = async (data) => {
    try {
      await alertAPI.create(data);
      refreshAllData();
    } catch (err) {
      alert(`Error creating alert: ${err.message}`);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await alertAPI.delete(id);
      refreshAllData();
    } catch (err) {
      alert(`Error deleting alert: ${err.message}`);
    }
  };

  // SIMULATION HANDLERS
  const handleStartSimulation = async () => {
    try {
      const res = await simulationAPI.start();
      setSimulationStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePauseSimulation = async () => {
    try {
      const res = await simulationAPI.pause();
      setSimulationStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetSimulationSpeed = async (multiplier) => {
    try {
      const res = await simulationAPI.setSpeed(multiplier);
      setSimulationStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await simulationAPI.reset();
      refreshAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick jump actions
  const trackBusOnMap = (busId) => {
    setSelectedBusId(busId);
    setActiveTab('map');
  };

  const viewRouteOnMap = (routeId) => {
    setActiveTab('map');
  };

  const viewStopOnMap = (stopId) => {
    setActiveTab('map');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        isConnected={isConnected}
        alerts={alerts}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 relative overflow-x-hidden">
        {activeTab === 'map' && (
          <MapView
            buses={buses}
            routes={routes}
            stops={stops}
            selectedBusId={selectedBusId}
            setSelectedBusId={setSelectedBusId}
            onAssignRoute={handleAssignRoute}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeTab === 'passenger' && (
          <PassengerView
            stops={stops}
            routes={routes}
            buses={buses}
            onTrackBusOnMap={trackBusOnMap}
          />
        )}

        {activeTab === 'buses' && (
          <FleetManager
            buses={buses}
            routes={routes}
            onCreateBus={handleCreateBus}
            onUpdateBus={handleUpdateBus}
            onDeleteBus={handleDeleteBus}
            onSelectBusOnMap={trackBusOnMap}
          />
        )}

        {activeTab === 'routes' && (
          <RouteManager
            routes={routes}
            stops={stops}
            buses={buses}
            onCreateRoute={handleCreateRoute}
            onUpdateRoute={handleUpdateRoute}
            onDeleteRoute={handleDeleteRoute}
            onViewRouteOnMap={viewRouteOnMap}
          />
        )}

        {activeTab === 'stops' && (
          <StopManager
            stops={stops}
            routes={routes}
            onCreateStop={handleCreateStop}
            onUpdateStop={handleUpdateStop}
            onDeleteStop={handleDeleteStop}
            onViewStopOnMap={viewStopOnMap}
          />
        )}
      </main>

      {/* Floating Simulation Toolbar (Active across all tabs for live testing) */}
      <SimulationToolbar
        simulationStatus={simulationStatus}
        stats={stats}
        onStart={handleStartSimulation}
        onPause={handlePauseSimulation}
        onSetSpeed={handleSetSimulationSpeed}
        onReset={handleResetSimulation}
      />

      {/* Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={alerts}
        routes={routes}
        onCreateAlert={handleCreateAlert}
        onDeleteAlert={handleDeleteAlert}
      />
    </div>
  );
}
