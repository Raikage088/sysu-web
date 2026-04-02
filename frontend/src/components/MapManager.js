/* global L */

/**
 * 🗺️ MapManager.js (Optimized Enterprise Edition)
 * Optimized for GPU rendering and Smart DOM updates.
 */

let map;
const markers = {};

/**
 * 🚛 PROFESSIONAL PULSING ICON GENERATOR
 */
const createTruckIcon = (status) => {
    const isOnline = status === 'online';
    const color = isOnline ? '#2ecc71' : '#ff4757';
    const bgSubtle = isOnline ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255, 71, 87, 0.15)';

    const htmlContent = `
        <div class="marker-container">
            <div class="pulse-ring" style="border-color: ${color}"></div>
            <div class="marker-core" style="background: ${bgSubtle}; border: 2px solid ${color}; color: ${color};">
                <span style="font-size: 18px;">🚛</span>
            </div>
        </div>
    `;

    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: htmlContent,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
};

export const initLeafletMap = (elementId) => {
    if (map) map.remove();

    // 🚀 INJECT OPTIMIZED CSS
    const styleId = 'map-marker-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .leaflet-marker-icon {
                /* 🏎️ GPU Acceleration: Moves rendering to Graphics Card */
                will-change: transform;
                transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) !important;
                backface-visibility: hidden;
                perspective: 1000px;
                transform-style: preserve-3d;
            }
            .marker-container {
                position: relative;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .marker-core {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                backdrop-filter: blur(4px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            }
            .pulse-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 3px solid;
                border-radius: 50%;
                animation: marker-pulse 2.5s infinite ease-out;
                z-index: 1;
                opacity: 0;
            }
            @keyframes marker-pulse {
                0% { transform: scale(0.5); opacity: 0.8; }
                100% { transform: scale(2.2); opacity: 0; }
            }
            .professional-tooltip {
                background: #222227 !important;
                border: 1px solid #333338 !important;
                color: #fff !important;
                font-family: 'Syne', sans-serif !important;
                font-weight: 600 !important;
                border-radius: 6px !important;
                padding: 4px 8px !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
            }
        `;
        document.head.appendChild(style);
    }

    map = L.map(elementId, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true // 🚀 Use Canvas for better performance
    }).setView([14.5995, 120.9842], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
    }).addTo(map);

    setTimeout(() => map && map.invalidateSize(), 250);
};

export const updateMarker = (data) => {
    if (!map) return;

    const { driverId, lat, lng, name } = data;
    const position = [parseFloat(lat), parseFloat(lng)];

    // 🚀 THE FIX: Siguraduhin na lowercase at may default na 'online'
    const status = (data.status || 'online').toLowerCase();

    if (markers[driverId]) {
        // 🚀 SMART UPDATE: Only update icon if status actually changed
        if (markers[driverId].lastStatus !== status) {
            markers[driverId].setIcon(createTruckIcon(status));
            markers[driverId].lastStatus = status;
        }
        markers[driverId].setLatLng(position);
    } else {
        // New marker initialization
        markers[driverId] = L.marker(position, {
            icon: createTruckIcon(status)
        }).addTo(map);

        markers[driverId].lastStatus = status;
        markers[driverId].bindTooltip(name || `Driver ${driverId}`, {
            direction: 'top',
            offset: [0, -10],
            className: 'professional-tooltip'
        });
    }
};

export const focusOnLocation = (lat, lng, zoom = 16) => {
    if (!map) return;
    map.flyTo([lat, lng], zoom, { animate: true, duration: 1.5 });
};

export const loadGoogleMap = () => Promise.resolve();
