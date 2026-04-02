import {focusOnLocation, initLeafletMap, updateMarker} from "../components/MapManager.js";
import {EVENTS, socket} from "../api/socket.js";
import {AuthService} from "../api/authService.js";

class Dashboard {
    constructor() {
        // Centralized Configuration for HTML
        this.config = {
            mapId: "open-map-sdk",
            panelId: "resize-panel",
            handleId: "drawer-handle",
            logoutBtnId: "logout-btn",
            tableBodyId: "shipment-rows"
        };

        // Application State
        this.drivers = {}; // Index: { "driverId": { lat, lng, name, status } }
        this.resizerState = {isDragging: false, startY: 0, startHeight: 0};

        // Method Binding
        this._handleMove = this._handleMove.bind(this);
        this._stopDragging = this._stopDragging.bind(this);

        // Caching the panel element for performance
        this.panelElement = null;
    }

    // Entry Point
    init() {
        console.log("🚀 Sysu Track: Starting Dashboard Engine...");

        this._initMap();
        this._initResizer();
        this._initAuth();
        this._setupSocketListener();
        this._setupTableInteraction()
    }

    // --- SOCKET LOGIC ---
    _setupSocketListener() {
        this._onDriverMoving = (data) => {
            // Update Map Marker
            updateMarker(data);

            // Update local state (drivers object)
            this.drivers[data.driverId] = {
                ...this.drivers[data.driverId], // keep old data if exists
                ...data,                         // apply new socket data
                status: 'online'                 // if moving, it's online
            };

            // Trigger UI Update
            this._renderTable();
        };

        this._onStatusUpdate = (data) => {
            if (this.drivers[data.driverId]) {
                this.drivers[data.driverId].status = data.status;

                updateMarker({
                    ...this.drivers[data.driverId],
                    driverId: data.driverId,
                    status: data.status
                });

                this._renderTable();
            }
        };
        socket.on(EVENTS.DRIVER_MOVING, this._onDriverMoving);
        socket.on(EVENTS.STATUS_UPDATE, this._onStatusUpdate);
    }

    // --- DOM MANIPULATION: RENDER TABLE ---
    _renderTable() {
        const tbody = document.getElementById(this.config.tableBodyId);
        if (!tbody) return;

        const driverList = Object.values(this.drivers);

        // Display No data if there's no driver
        if (driverList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="px-4 py-8 text-center text-gray-600 font-mono italic">Waiting for incoming driver data...</td></tr>`;
            return;
        }

        tbody.innerHTML = driverList.map(driver => {
            // SAFE CHECK: Check if there's driverId turn it to string
            const id = driver.driverId ? String(driver.driverId) : "000000";
            const displayId = id.substring(0, 6).toUpperCase();

            return `
            <tr data-driver-id="${driver.driverId}" class="hover:bg-white/5 transition-colors group border-b border-white/5 cursor-pointer active:bg-accent/10">
                <td class="px-4 py-3 text-gray-500 font-mono text-[10px]">
                    #${displayId}
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full 
                        ${driver.status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} 
                        text-[9px] font-bold font-mono uppercase">
                        <span class="relative flex h-1.5 w-1.5">
                            <span class="absolute inline-flex h-full w-full rounded-full opacity-75
                                ${driver.status === 'online' ? 'animate-ping bg-green-400' : 'bg-red-400'}"></span>
                            <span class="relative inline-flex rounded-full h-1.5 w-1.5
                                ${driver.status === 'online' ? 'bg-green-500' : 'bg-red-500'}"></span>
                        </span>
                        ${driver.status}
                    </span>
                </td>
                <td class="px-4 py-3 text-gray-300">Customer N/A</td>
                <td class="px-4 py-3 text-accent font-semibold">${driver.name || 'Unknown Driver'}</td>
                <td class="px-4 py-3 text-gray-500 font-mono text-[10px]">
                    ${Number(driver.lat || 0).toFixed(4)}, ${Number(driver.lng || 0).toFixed(4)}
                </td>
                <td class="px-4 py-3 text-gray-400">
                    ${driver.status === 'online' ? 'Active Tracking' : 'Last Known Location'}
                </td>
                <td class="px-4 py-3 text-gray-500 font-mono italic text-[10px]">REAL-TIME</td>
            </tr>
            `;
        }).join('');
    }

    // --- MAP LOGIC ---
    _initMap() {
        try {
            initLeafletMap(this.config.mapId);
        } catch (err) {
            console.error("Map Initialization Error:", err);
        }
    }

    // --- RESIZER LOGIC ---
    _initResizer() {
        this.panelElement = document.getElementById(this.config.panelId);
        const handle = document.getElementById(this.config.handleId);

        if (!this.panelElement || !handle) return;

        handle.addEventListener("mousedown", (e) => {
            this.resizerState.isDragging = true;
            this.resizerState.startY = e.clientY;
            this.resizerState.startHeight = this.panelElement.offsetHeight;

            window.addEventListener("mousemove", this._handleMove);
            window.addEventListener("mouseup", this._stopDragging);
            this.panelElement.classList.add("dragging");
        });
    }

    _handleMove(e) {
        if (!this.resizerState.isDragging) return;

        window.requestAnimationFrame(() => {
            const deltaY = this.resizerState.startY - e.clientY;
            const newHeight = this.resizerState.startHeight + deltaY;

            // Constraints: 40px minimum, 80% of screen height maximum
            const constrainedHeight = Math.max(40, Math.min(newHeight, window.innerHeight * 0.8));
            this.panelElement.style.height = `${constrainedHeight}px`;
        });
    }

    _stopDragging() {
        this.resizerState.isDragging = false;
        window.removeEventListener("mousemove", this._handleMove);
        window.removeEventListener("mouseup", this._stopDragging);

        if (this.panelElement) this.panelElement.classList.remove("dragging");
    }

    // --- AUTH & CLEANUP ---
    _initAuth() {
        const logoutBtn = document.getElementById(this.config.logoutBtnId);
        if (!logoutBtn) return;

        logoutBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to logout?")) {
                try {
                    this.destroy(); // Cleanup before leaving
                    await AuthService.logout();
                    localStorage.clear();
                    window.location.href = "/index.html";
                } catch (error) {
                    console.error("Logout failed:", error);
                }
            }
        });
    }

    _setupTableInteraction() {
        const tbody = document.getElementById(this.config.tableBodyId)
        if (!tbody) return;

        tbody.addEventListener("click", (e) => {
            // Find the closest row that have been clicked from tbody
            const row = e.target.closest("tr");
            if (!row) return;

            // Takes driverId from data attribute
            const driverId = row.getAttribute("data-driver-id");

            // Saves the data taken from the attribute
            const driverData = this.drivers[driverId];

            if (driverData && driverData.lat && driverData.lng) {
//                console.log(`Focus on current position of driver: Driver ${driverId}`);

                focusOnLocation(driverData.lat, driverData.lng)
            }
        })
    }

    destroy() {
        console.log("🧹 Cleaning up Dashboard resources...");
        if (this._onDriverMoving) socket.off(EVENTS.DRIVER_MOVING, this._onDriverMoving);
        if (this._onStatusUpdate) socket.off(EVENTS.STATUS_UPDATE, this._onStatusUpdate);

        window.removeEventListener("mousemove", this._handleMove);
        window.removeEventListener("mouseup", this._stopDragging);
    }
}

// Initializer
document.addEventListener("DOMContentLoaded", () => {
    const dashboard = new Dashboard();
    dashboard.init();
});