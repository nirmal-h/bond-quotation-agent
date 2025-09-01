import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { irpRoutes } from './routes/irp.js';
import { sanctionRoutes } from './routes/sanction.js';
import { ragRoutes } from './routes/rag.js';
import { quotationRoutes } from './routes/quotation.js';
import { bondPayloadRoutes } from './routes/bond-payload.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/irp', irpRoutes);
app.use('/api/sanction', sanctionRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/quotation', quotationRoutes);
app.use('/api/bond', bondPayloadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Bond Quotation API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 