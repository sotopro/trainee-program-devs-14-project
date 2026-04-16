import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// #region agent log
fetch('http://127.0.0.1:7290/ingest/2833fe70-b26d-40b6-a3f8-246eaeb70ee1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'323221'},body:JSON.stringify({sessionId:'323221',runId:'pre-fix',hypothesisId:'H3',location:'frontend/vite.config.ts:4',message:'Vite config loaded before alias fix',data:{hasAliasConfig:false},timestamp:Date.now()})}).catch(()=>{});
// #endregion

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
