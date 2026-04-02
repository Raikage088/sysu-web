import {io} from "socket.io-client";

const SOCKET_URL = "http://localhost:3001"

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
});

export const EVENTS = {
    DRIVER_MOVING: "update_admin_map",
    STATUS_UPDATE: "vendor_status_update",
}