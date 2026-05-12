import path from 'path';
import dotenv from 'dotenv';

// Load env from workspace root so server picks up root .env
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

import { App } from './src/app';

const port = Number(process.env.API_PORT ?? 3000);
const app = new App(port);
app.listen();
