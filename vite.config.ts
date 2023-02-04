import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const localBackendUrl = 'http://localhost:8883'

// https://vitejs.dev/config/
export default defineConfig({
   server: {
      port: 3001,
      proxy: {
         '/api/graphql': localBackendUrl,
         '/ws/graphql': localBackendUrl,
         '/login': localBackendUrl,
         '/logout': localBackendUrl,
         '/session': localBackendUrl,
         '/token': localBackendUrl,
      },
   },
   plugins: [react(), tsconfigPaths()],
})
