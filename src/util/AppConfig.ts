export const AppConfig = (() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const MODE = import.meta.env.MODE
    const DEV = import.meta.env.DEV
    const PROD = import.meta.env.DEV

    const httpPrefix = DEV ? 'http' : 'https'
    const wsPrefix = DEV ? 'ws' : 'wss'
    const httpBase = `${httpPrefix}://${backendUrl}`
    return {
        MODE,
        DEV,
        PROD,
        backendUrl,
        httpBase,
        httpGraphEndpoint: `${httpBase}/api/graphql`,
        httpSessionEndpoint: `${httpBase}/session`,
        websocketGraphEndpoint:`${wsPrefix}://${backendUrl}/ws/graphql`
    }
})()