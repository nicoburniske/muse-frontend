export const AppConfig = (() => {
    // Need to prefix all environment variables with VITE_
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const MODE = import.meta.env.MODE
    const DEV = import.meta.env.DEV
    const PROD = import.meta.env.PROD

    const prodEndpoint = (suffix: string) => `https://${backendUrl}${suffix}`

    return {
        MODE,
        DEV,
        PROD,
        // Double slash for absolute path.
        loginRedirect: DEV ?  '/login' : `//${backendUrl}/login`,
        logoutEndpoint: DEV ?  '/logout' : prodEndpoint('/logout'),
        httpGraphEndpoint: DEV ?  '/api/graphql' : prodEndpoint('/api/graphql'),
        httpSessionEndpoint: DEV ?  '/session' : prodEndpoint('/session'),
        httpAccessTokenEndpoint: DEV ?  '/token' : prodEndpoint('/token'),
        websocketGraphEndpoint: DEV ?  '/ws/graphql' : prodEndpoint('/ws/graphql'),
    }
})()