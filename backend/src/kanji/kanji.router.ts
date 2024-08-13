import express, { Router } from 'express';
// import { findDuolingoKanji, getDuolingoKanji } from './kanji.controller';
import { getDuolingoKanji } from './kanji.controller';

export const router: Router = express.Router();

router.get('/duolingo-kanji', getDuolingoKanji);
// router.post('/duolingo-kanji/find', findDuolingoKanji);
