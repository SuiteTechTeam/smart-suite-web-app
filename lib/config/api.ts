// Configuración centralizada de la API
export const API_CONFIG = {
  BASE_URL: "https://smart-suite-web-service.azurewebsites.net/api/v1",
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: "/authentication/sign-in",
      SIGN_UP_OWNER: "/authentication/sign-up-owner", 
      SIGN_UP_ADMIN: "/authentication/sign-up-admin",
      SIGN_UP_GUEST: "/authentication/sign-up-guest",
    },    USER: {
      UPDATE_OWNER: "/user/update-owner",
      UPDATE_ADMIN: "/user/update-admin", 
      UPDATE_GUEST: "/user/update-guest",
      OWNERS: "/user/owners",
      ADMINS: "/user/admins",
      GUESTS: "/user/guests",
    },
    INVENTORY: "/inventory",
    SUPPLY: {
      CREATE: "/supply/create-supply",
      UPDATE: "/supply/{id}",
      GET_BY_ID: "/supply/{id}",
      GET_ALL: "/supply/get-all-supplies",
      GET_BY_PROVIDER: "/supply/provider/{providerId}",
    },
    SUPPLY_REQUEST: {
      CREATE: "/supply-request",
      GET_BY_HOTEL: "/supply-request/hotelid/{hotelId}",
      GET_BY_ID: "/supply-request/{id}",
      GET_BY_PAYMENT_OWNER: "/supply-request/paymentowner/{paymentOwnerId}",
      GET_BY_SUPPLY: "/supply-request/supply/{supplyId}",
    },
    ROOMS: {
      CREATE: "/room/create-room",
      UPDATE_STATE: "/room/update-room-state", 
      GET_BY_ID: "/room/get-room-by-id",
      GET_BY_STATE: "/room/get-room-by-state",
      GET_ALL: "/room/get-all-rooms",
      GET_BY_TYPE: "/room/get-room-by-type-room",
      GET_BY_BOOKING: "/room/get-room-by-booking-availability"
    },
    IOT: {
      DEVICES: {
        CREATE: "/io-t/iot-devices",
        GET_ALL: "/io-t/iot-devices",
        UPDATE: "/io-t/iot-devices/{id}",
        GET_BY_ID: "/io-t/iot-devices/{id}",
      },
      ROOM_DEVICES: {
        CREATE: "/io-t/room-devices",
        UPDATE: "/io-t/room-devices/{id}",
        GET_BY_IOT_DEVICE: "/io-t/room-devices/by-iot-device/{ioTDeviceId}",
        GET_BY_ROOM: "/io-t/room-devices/by-room/{roomId}",
      },
      NOTIFICATIONS: {
        CREATE: "/io-t/notification-history",
        GET_BY_ROOM: "/io-t/notification-history/by-room/{roomId}",
      }
    }
  }
} as const;

// Helper function para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
