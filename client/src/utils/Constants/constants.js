const SERVER_IP = "localhost:3977";

export const ENV = {
    BASE_PATH: `http://${SERVER_IP}`,
    BASE_API: `http://${SERVER_IP}/api/v1`,
    API_ROUTES: {
        REGISTER: "auth/register",
        LOGIN: "auth/login",
        USER_ME: "user/me",
        REFRESH_ACCESS_TOKEN: "auth/refresh_access_token",
        PRODUCT: "product",
        CART: {
            ADD: "add",
            REMOVE: "remove",
            GET: "cart"
        },
        APPOINMENT: "appoinment",
        CHECKOUT: "checkout",
        PREFERENCE: "create_preference",
    },
    JWT: {
        ACCESS: "access",
        REFRESH: "refresh",
    },
}