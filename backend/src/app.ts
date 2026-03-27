import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler, notFound } from './common/middleware';
import authRoutes from './modules/auth/routes';
import superAdminRoutes from './modules/super-admin/routes';
import patientRoutes from './modules/patients/routes';
import eligibilityRoutes from './modules/eligibility/routes';
import auditLogRoutes from './modules/audit-logs/routes';
import usersRoutes from './modules/users/routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('API is runninggggg bro');
});
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(notFound);

// Error handling
app.use(errorHandler);

export default app;