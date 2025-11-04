import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import swapRoutes from './routes/swap';

const app = express();

const allowedOrigins = [
    'https://service-hive-assiment-i8xj6a3zb-kanishk1122s-projects.vercel.app',
    'http://localhost:3000',
];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy: This origin is not allowed'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Trust proxy if behind one (e.g. Vercel)
app.set('trust proxy', true);

// Apply configured CORS
app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', swapRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

export default app;
