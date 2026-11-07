import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Database Connected Successfully!');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB Connection Error:', err);
    });

    // Added TLS flags to handle local Node.js SSL handshake issues
    await mongoose.connect(process.env.MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
  } catch (error) {
    console.error('Failed to connect to DB:', error.message);
  }
};

export default connectDB;