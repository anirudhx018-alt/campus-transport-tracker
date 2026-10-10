const dataStore = require('../dataStore');

// Helper to compute distance in meters between two lat/lng coordinates (Haversine)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to compute bearing / heading in degrees (0 = North, 90 = East, etc.)
function getHeading(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  return (Math.round((theta * 180) / Math.PI) + 360) % 360;
}

class SimulationService {
  constructor() {
    this.interval = null;
    this.io = null;
    this.isRunning = false;
    this.speedMultiplier = 1;
    this.tickRateMs = 2000;
    this.busDwellCounters = new Map(); // tracks how long a bus is waiting at a stop
  }

  initialize(io) {
    this.io = io;
    this.start();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Simulation] Real-time GPS movement simulation started.');

    this.interval = setInterval(async () => {
      try {
        await this.tick();
      } catch (err) {
        console.error('[Simulation Error]:', err.message);
      }
    }, this.tickRateMs);
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('[Simulation] Paused.');
    if (this.io) {
      this.io.emit('simulation_status', this.getStatus());
    }
  }

  setSpeed(multiplier) {
    this.speedMultiplier = Math.max(0.5, Math.min(10, Number(multiplier) || 1));
    console.log(`[Simulation] Speed multiplier set to ${this.speedMultiplier}x`);
    if (this.io) {
      this.io.emit('simulation_status', this.getStatus());
    }
  }

  async reset() {
    console.log('[Simulation] Resetting buses to initial route positions...');
    const buses = await dataStore.getAllBuses();
    const routes = await dataStore.getAllRoutes();
    const routeMap = new Map(routes.map(r => [r._id.toString(), r]));

    for (const bus of buses) {
      const rId = bus.routeId?._id ? bus.routeId._id.toString() : bus.routeId?.toString();
      const route = routeMap.get(rId);

      if (route && route.pathCoordinates && route.pathCoordinates.length > 0) {
        const firstCoord = route.pathCoordinates[0];
        await dataStore.updateBus(bus._id, {
          currentWaypointIndex: 0,
          currentLocation: {
            lat: firstCoord[0],
            lng: firstCoord[1],
            heading: 0,
            speed: 0
          },
          status: bus.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'IN_TRANSIT',
          etaMinutes: 2
        });
      }
    }

    this.busDwellCounters.clear();
    const updatedBuses = await dataStore.getAllBuses();
    if (this.io) {
      this.io.emit('buses_updated', updatedBuses);
      this.io.emit('simulation_status', this.getStatus());
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      speedMultiplier: this.speedMultiplier,
      tickRateMs: this.tickRateMs
    };
  }

  async tick() {
    const buses = await dataStore.getAllBuses();
    const routes = await dataStore.getAllRoutes();
    const stops = await dataStore.getAllStops();

    const routeMap = new Map(routes.map(r => [r._id.toString(), r]));
    const stopMap = new Map(stops.map(s => [s._id.toString(), s]));

    let updatedAny = false;

    for (const bus of buses) {
      // Skip buses that are in maintenance or idle
      if (bus.status === 'MAINTENANCE' || bus.status === 'IDLE') {
        continue;
      }

      const rId = bus.routeId?._id ? bus.routeId._id.toString() : bus.routeId?.toString();
      const route = routeMap.get(rId);

      if (!route || !route.pathCoordinates || route.pathCoordinates.length < 2) {
        continue;
      }

      const path = route.pathCoordinates;
      let wayIndex = bus.currentWaypointIndex || 0;
      let busStatus = bus.status;
      let occupancy = bus.currentOccupancy || 0;

      // Check if bus is currently dwelling at a stop
      const busKey = bus._id.toString();
      const currentDwell = this.busDwellCounters.get(busKey) || 0;

      if (currentDwell > 0) {
        // Decrement dwell counter
        this.busDwellCounters.set(busKey, currentDwell - 1);
        if (currentDwell - 1 === 0) {
          // Finished stop dwell, resume transit
          busStatus = 'IN_TRANSIT';
          this.busDwellCounters.delete(busKey);
        } else {
          // Still at stop
          busStatus = 'STOPPED';
          continue;
        }
      }

      // Advance waypoint
      const nextWayIndex = (wayIndex + 1) % path.length;
      const curCoord = path[wayIndex];
      const nextCoord = path[nextWayIndex];

      const heading = getHeading(curCoord[0], curCoord[1], nextCoord[0], nextCoord[1]);
      const baseSpeed = Math.floor(25 + Math.random() * 15); // 25 - 40 km/h
      const effectiveSpeed = Math.round(baseSpeed * this.speedMultiplier);

      // Advance waypoint index
      wayIndex = nextWayIndex;

      // Check proximity to route stops
      let closestStop = null;
      let minStopDist = Infinity;
      let nextUpcomingStop = null;

      if (route.stops && route.stops.length > 0) {
        for (const rStop of route.stops) {
          const stopObj = rStop.stop || stopMap.get(rStop.stopId?.toString() || rStop.stopId);
          if (stopObj) {
            const dist = getDistanceMeters(nextCoord[0], nextCoord[1], stopObj.lat, stopObj.lng);
            if (dist < minStopDist) {
              minStopDist = dist;
              closestStop = stopObj;
            }
          }
        }
      }

      // If within 40m of a stop and was not just dwelling, trigger stop dwell
      if (minStopDist <= 40 && busStatus !== 'STOPPED') {
        busStatus = 'STOPPED';
        this.busDwellCounters.set(busKey, 2); // dwell for 2 ticks

        // Realistic passenger exchange
        const capacity = bus.capacity || 40;
        const alighting = Math.floor(Math.random() * 6);
        const boarding = Math.floor(Math.random() * 8);
        occupancy = Math.max(2, Math.min(capacity, occupancy - alighting + boarding));
      } else if (busStatus !== 'STOPPED') {
        busStatus = 'IN_TRANSIT';
      }

      // Find next scheduled stop
      if (route.stops && route.stops.length > 0) {
        // Pick upcoming stop
        const rStops = route.stops.map(rs => rs.stop || stopMap.get(rs.stopId?.toString() || rs.stopId)).filter(Boolean);
        if (rStops.length > 0) {
          // Select stop that is ahead
          let bestStop = rStops[0];
          let bestDist = Infinity;
          for (const s of rStops) {
            const d = getDistanceMeters(nextCoord[0], nextCoord[1], s.lat, s.lng);
            if (d > 20 && d < bestDist) {
              bestDist = d;
              bestStop = s;
            }
          }
          nextUpcomingStop = bestStop;
        }
      }

      // Calculate ETA (distance / speed)
      let etaMinutes = 1;
      if (nextUpcomingStop) {
        const distM = getDistanceMeters(nextCoord[0], nextCoord[1], nextUpcomingStop.lat, nextUpcomingStop.lng);
        const speedMps = (baseSpeed * 1000) / 3600; // meters per second
        etaMinutes = Math.max(1, Math.ceil(distM / (speedMps * 60)));
      }

      const updateData = {
        currentWaypointIndex: wayIndex,
        currentLocation: {
          lat: nextCoord[0],
          lng: nextCoord[1],
          heading: heading,
          speed: busStatus === 'STOPPED' ? 0 : effectiveSpeed
        },
        status: busStatus,
        currentOccupancy: occupancy,
        nextStopId: nextUpcomingStop ? nextUpcomingStop._id : null,
        etaMinutes: busStatus === 'STOPPED' ? 0 : etaMinutes
      };

      await dataStore.updateBus(bus._id, updateData);
      updatedAny = true;
    }

    if (updatedAny && this.io) {
      const freshBuses = await dataStore.getAllBuses();
      this.io.emit('buses_updated', freshBuses);
    }
  }
}

const simulationService = new SimulationService();
module.exports = simulationService;
