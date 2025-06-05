import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { mainRoutes } from './routes/main';
import { authRoutes } from './routes/auth';
import { adminRoutes } from './routes/admin';
import dotenv from 'dotenv';
dotenv.config();

const server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.static('public'));

server.use('/api', mainRoutes);
server.use('/api/auth', authRoutes);
server.use('/api/admin', adminRoutes);

server.listen(4444, () => {
    console.log('IBTBLOG backend running...');
});