import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  password: {
    type: String,
    required: true,
  },
  salt: String,
  kanji: [
    {
      character: String,
      mastered: Boolean,
      grade: Boolean,
      jlpt: Boolean,
      rtk: Boolean,
      wk: Boolean,
      duolingo: Boolean,
    },
  ],
});

export default mongoose.model('User', userSchema);
