import mongoose from 'mongoose';
import 'dotenv/config';

export const dbConnect = async () => {
  const mongodbUri = process.env.MONGODB_URI;
  // ts flennt sonst weil string | undefined möglich ist, aber connect nur mit string geht
  if (mongodbUri) {
    try {
      mongoose.connect(mongodbUri);
      console.log('✅ mongodb connection');
    } catch (error) {
      console.error('Mongoose connection error', error);
    }
  }
};

mongoose.connection.on('connect', () =>
  console.log('🟢 mongodb server connected')
);
mongoose.connection.on('disconnect', () =>
  console.log('🔴 mongodb server disconnected')
);
