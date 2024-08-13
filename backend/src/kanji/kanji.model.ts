import mongoose from 'mongoose';

const kanjiSchema = new mongoose.Schema({
  character: String,
  strokes: Number,
  frequency: Number,
  grade: Number,
  jlpt_level: Number,
  rtk_index: Number,
  rtk_keyword_eng: String,
  rtk_keyword_de: String,
  rtk_chapter: Number,
  wk_level: Number,
  wk_meanings: [String],
  duolingo_unit: String,
});

export default mongoose.model('Kanji', kanjiSchema);
