import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from '@api/modules/auth/auth.routes';
import usersRoutes from '@api/modules/users/users.routes';
import { errorHandler, notFoundHandler } from '@api/core/middleware/error.middleware';

export class App {
  private app: Application;
  private port: number;

  constructor(port = 3000) {
    this.app = express();
    this.port = port;
    this.bootstrap();
  }

  private bootstrap(): void {
    this.registerGlobalMiddleware();
    this.registerRoutes();
    this.registerErrorHandlers();
  }

  private registerGlobalMiddleware(): void {
    this.app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private registerRoutes(): void {
    this.app.get('/health', (_req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', usersRoutes);
  }

  private registerErrorHandlers(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  listen(): void {
    this.app.listen(this.port, () => {
      console.log(`[server] Running on http://localhost:${this.port}`);
    });
  }

  getApp(): Application {
    return this.app;
  }
}
