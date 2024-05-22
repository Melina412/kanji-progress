import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { dbConnect } from './config/storage.config';

import { router as KanjiRouter } from './kanji/kanji.router';

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/kanji', KanjiRouter);

const PORT = process.env.PORT;

app.get('/', (_: Request, res: Response) => {
  res.json({ message: 'hi from typescript express server' });
});

app.listen(PORT, () => {
  dbConnect(), console.log('✅ express runs on port', PORT);
});
