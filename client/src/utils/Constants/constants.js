const SERVER_IP = "https://back-servimacotas.onrender.com/";

export const ENV = {
    BASE_PATH: `${SERVER_IP}`,
    BASE_API: `${SERVER_IP}/api/v1`,
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
        POST_CHECKOUT: "post-checkout"
    },
    JWT: {
        ACCESS: "access",
        REFRESH: "refresh",
    },
}