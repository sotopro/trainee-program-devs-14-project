import { createApp } from './app.js';

const PORT = 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Health] http://localhost:${PORT}/api/health`);
});
