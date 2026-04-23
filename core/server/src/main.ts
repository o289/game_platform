// app/server/main.ts

import 'dotenv/config';

import { createApp } from './createApp';
import { createServer } from './createServer';

const app = createApp();
const server = createServer(app);

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
