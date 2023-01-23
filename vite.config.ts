import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'


// https://vitejs.dev/config/
export default defineConfig({
    server: {
        proxy: {
            '/api/graphql': 'http://localhost:8883',
            '/session': 'http://localhost:8883',
            '/token': 'http://localhost:8883',
            '/ws/graphql': 'http://localhost:8883',
        }
    },
    plugins: [react(), tsconfigPaths()]
})
