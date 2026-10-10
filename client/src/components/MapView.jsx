import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bus, MapPin, Navigation, Gauge, Users, Clock, Phone, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

export default function MapView({
  buses = [],
  routes = [],
  stops = [],
  selectedBusId,
  setSelectedBusId,
  onAssignRoute,
  onStatusChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({ buses: new Map(), stops: new Map(), polylines: new Map() });

  const [activeRouteFilter, setActiveRouteFilter] = useState('ALL');
  const [selectedStop, setSelectedStop] = useState(null);

  // Default campus center coordinates (Stanford University Campus)
  const CAMPUS_CENTER = [37.4285, -122.1695];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_CENTER,
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    // Dark sleek high-performance tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render or update Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old polylines
    markersRef.current.polylines.forEach(poly => map.removeLayer(poly));
    markersRef.current.polylines.clear();

    routes.forEach(route => {
      if (activeRouteFilter !== 'ALL' && route._id !== activeRouteFilter) return;
      if (!route.pathCoordinates || route.pathCoordinates.length < 2) return;

      const polyline = L.polyline(route.pathCoordinates, {
        color: route.color || '#3B82F6',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: route.status === 'SUSPENDED' ? '6, 8' : undefined
      }).addTo(map);

      polyline.bindTooltip(
        `<div class="font-bold text-xs">${route.name} (${route.code})</div><div class="text-[10px] text-slate-300">${route.stops?.length || 0} stops • Every ${route.schedule?.frequencyMinutes || 15}m</div>`,
        { sticky: true, className: 'leaflet-popup-content-wrapper' }
      );

      markersRef.current.polylines.set(route._id, polyline);
    });
  }, [routes, activeRouteFilter]);

  // Render or update Stops Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old stops
    markersRef.current.stops.forEach(m => map.removeLayer(m));
    markersRef.current.stops.clear();

    stops.forEach(stop => {
      const stopIcon = L.divIcon({
        className: 'custom-stop-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        html: `
          <div class="w-7 h-7 rounded-full bg-slate-900 border-2 border-indigo-400 text-indigo-400 flex items-center justify-center shadow-lg hover:scale-125 transition-transform cursor-pointer">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        `
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedStop(stop);
        setSelectedBusId(null);
      });

      marker.bindTooltip(
        `<div class="font-bold text-xs">${stop.name}</div><div class="text-[10px] text-slate-400">${stop.code} • ${stop.landmark || 'Campus Stop'}</div>`,
        { direction: 'top', offset: [0, -10] }
      );

      markersRef.current.stops.set(stop._id, marker);
    });
  }, [stops]);

  // Render or update Buses Markers (live updates smoothly)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentBusIds = new Set(buses.map(b => b._id));

    // Remove obsolete markers
    markersRef.current.buses.forEach((marker, id) => {
      if (!currentBusIds.has(id)) {
        map.removeLayer(marker);
        markersRef.current.buses.delete(id);
      }
    });

    buses.forEach(bus => {
      const rId = bus.routeId?._id || bus.routeId;
      if (activeRouteFilter !== 'ALL' && rId !== activeRouteFilter) {
        if (markersRef.current.buses.has(bus._id)) {
          map.removeLayer(markersRef.current.buses.get(bus._id));
          markersRef.current.buses.delete(bus._id);
        }
        return;
      }

      const lat = bus.currentLocation?.lat || CAMPUS_CENTER[0];
      const lng = bus.currentLocation?.lng || CAMPUS_CENTER[1];
      const heading = bus.currentLocation?.heading || 0;
      const speed = bus.currentLocation?.speed || 0;
      const routeColor = bus.routeId?.color || '#2563EB';
      const isSelected = selectedBusId === bus._id;

      const isStopped = bus.status === 'STOPPED';
      const isMaintenance = bus.status === 'MAINTENANCE';

      const busIconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          ${!isMaintenance ? `<div class="absolute w-11 h-11 rounded-full radar-wave" style="background-color: ${routeColor}40;"></div>` : ''}
          <div class="w-8 h-8 rounded-lg shadow-xl flex items-center justify-center text-white border-2 ${isSelected ? 'border-amber-400 ring-4 ring-amber-400/40' : 'border-white'} transition-all duration-300"
               style="background-color: ${isMaintenance ? '#64748B' : routeColor};">
            <svg class="w-4 h-4 transition-transform duration-300" style="transform: rotate(${heading}deg);" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
          <div class="absolute -bottom-4 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded shadow border border-slate-700 whitespace-nowrap">
            ${bus.busNumber}
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        className: 'custom-bus-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        html: busIconHtml
      });

      if (markersRef.current.buses.has(bus._id)) {
        const marker = markersRef.current.buses.get(bus._id);
        marker.setLatLng([lat, lng]);
        marker.setIcon(busIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: busIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedBusId(bus._id);
          setSelectedStop(null);
        });

        markersRef.current.buses.set(bus._id, marker);
      }
    });
  }, [buses, selectedBusId, activeRouteFilter]);

  // Recenter on campus
  const recenterCampus = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(CAMPUS_CENTER, 15, { duration: 1.2 });
    }
  };

  // Center on selected bus
  useEffect(() => {
    if (selectedBusId && mapInstanceRef.current) {
      const bus = buses.find(b => b._id === selectedBusId);
      if (bus && bus.currentLocation) {
        mapInstanceRef.current.panTo([bus.currentLocation.lat, bus.currentLocation.lng], {
          animate: true,
          duration: 0.8
        });
      }
    }
  }, [selectedBusId]);

  const selectedBus = buses.find(b => b._id === selectedBusId);

  // Incoming buses for selected stop
  const incomingBusesForStop = selectedStop
    ? buses.filter(b => b.status !== 'MAINTENANCE' && b.status !== 'IDLE' && b.nextStopId === selectedStop._id)
    : [];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden flex">
      {/* MAP CONTAINER */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP FLOATING ROUTE FILTER BAR */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl max-w-full">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 hidden sm:inline">
          Filter Route:
        </span>
        <button
          onClick={() => setActiveRouteFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeRouteFilter === 'ALL'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          All Routes ({routes.length})
        </button>
        {routes.map(route => (
          <button
            key={route._id}
            onClick={() => setActiveRouteFilter(route._id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeRouteFilter === route._id
                ? 'text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
            style={{
              backgroundColor: activeRouteFilter === route._id ? route.color : 'transparent',
              borderColor: route.color
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color }}></span>
            <span>{route.name}</span>
          </button>
        ))}
      </div>

      {/* TOP RIGHT QUICK CONTROLS */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={recenterCampus}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900/90 backdrop-blur-md hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl border border-slate-800 shadow-xl text-xs font-medium transition-all"
          title="Recenter to Central Campus"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <span>Campus Center</span>
        </button>
      </div>

      {/* BUS DETAIL HUD CARD (When Bus Selected) */}
      {selectedBus && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-20 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-5 text-white animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                style={{ backgroundColor: selectedBus.routeId?.color || '#2563EB' }}
              >
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">{selectedBus.busNumber}</h3>
                <p className="text-xs text-slate-400">Plate: {selectedBus.plateNumber}</p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  selectedBus.status === 'IN_TRANSIT'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : selectedBus.status === 'STOPPED'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : selectedBus.status === 'MAINTENANCE'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                }`}
              >
                {selectedBus.status.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedBusId(null)}
                className="text-xs text-slate-500 hover:text-slate-300 mt-1"
              >
                Close ✕
              </button>
            </div>
          </div>

          {/* Route info */}
          <div className="py-3">
            <div className="text-xs text-slate-400 mb-1">Assigned Route</div>
            <div className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedBus.routeId?.color || '#64748B' }}
              ></span>
              <span className="font-semibold text-sm">
                {selectedBus.routeId?.name || 'Unassigned / Standby'}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>Speed</span>
              </div>
              <div className="text-base font-bold text-white">
                {selectedBus.currentLocation?.speed || 0}{' '}
                <span className="text-xs text-slate-400 font-normal">km/h</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>ETA Next Stop</span>
              </div>
              <div className="text-base font-bold text-white">
                {selectedBus.etaMinutes || 0}{' '}
                <span className="text-xs text-slate-400 font-normal">min</span>
              </div>
            </div>
          </div>

          {/* Capacity Gauge */}
          <div className="py-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Passenger Load</span>
              </div>
              <span className="font-semibold">
                {selectedBus.currentOccupancy || 0} / {selectedBus.capacity || 40} seats
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  (selectedBus.currentOccupancy / (selectedBus.capacity || 1)) > 0.85
                    ? 'bg-rose-500'
                    : (selectedBus.currentOccupancy / (selectedBus.capacity || 1)) > 0.6
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.round(((selectedBus.currentOccupancy || 0) / (selectedBus.capacity || 1)) * 100))}%`
                }}
              ></div>
            </div>
          </div>

          {/* Driver Contact */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span className="text-slate-500">Driver:</span>{' '}
              <span className="text-slate-200 font-medium">{selectedBus.driverName}</span>
            </div>
            {selectedBus.driverPhone && (
              <a
                href={`tel:${selectedBus.driverPhone}`}
                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium"
              >
                <Phone className="w-3 h-3" />
                <span>{selectedBus.driverPhone}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* STOP DETAIL HUD CARD (When Stop Selected) */}
      {selectedStop && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-20 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl p-5 text-white animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">{selectedStop.name}</h3>
                <span className="text-xs font-mono text-indigo-400">{selectedStop.code}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedStop(null)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Close ✕
            </button>
          </div>

          <div className="py-3 text-xs text-slate-300 border-b border-slate-800">
            <p className="mb-1">{selectedStop.description || 'Campus bus passenger pick-up & drop-off stop.'}</p>
            <div className="flex items-center space-x-3 text-slate-400 mt-2">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedStop.hasShelter ? 'Sheltered Stop' : 'Open Stop'}</span>
              </span>
              <span>•</span>
              <span>{selectedStop.landmark || 'Main Campus'}</span>
            </div>
          </div>

          {/* Incoming Buses Arrival Board */}
          <div className="pt-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Next Arrivals</span>
            </h4>

            {incomingBusesForStop.length === 0 ? (
              <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-center">
                No shuttles currently approaching this stop in direct sequence. Check route schedule.
              </div>
            ) : (
              <div className="space-y-2">
                {incomingBusesForStop.map(bus => (
                  <div
                    key={bus._id}
                    onClick={() => {
                      setSelectedBusId(bus._id);
                      setSelectedStop(null);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-2.5 h-8 rounded-full"
                        style={{ backgroundColor: bus.routeId?.color || '#3B82F6' }}
                      ></div>
                      <div>
                        <div className="font-bold text-xs">{bus.busNumber}</div>
                        <div className="text-[11px] text-slate-400">{bus.routeId?.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{bus.etaMinutes || 1} min</div>
                      <div className="text-[10px] text-slate-400">{bus.currentLocation?.speed} km/h</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
