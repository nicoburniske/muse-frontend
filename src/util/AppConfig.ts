export const AppConfig = (() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const MODE = import.meta.env.MODE
    const DEV = import.meta.env.DEV
    const PROD = import.meta.env.DEV

    return {
        MODE,
        DEV,
        PROD,
        loginEndpoint: DEV ?  '/login' : `${backendUrl}/login`,
        logoutEndpoint: DEV ?  '/logout' : `${backendUrl}/logout`,
        httpGraphEndpoint: DEV ?  '/api/graphql' : `${backendUrl}/api/graphql`,
        httpSessionEndpoint: DEV ?  '/session' : `${backendUrl}/session`,
        httpAccessTokenEndpoint: DEV ?  '/token' : `${backendUrl}/token`,
        websocketGraphEndpoint: DEV ?  '/ws/graphql' : `${backendUrl}/ws/graphql`,
    }
})()