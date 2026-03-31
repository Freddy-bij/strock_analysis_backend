import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Enhanced connection options for MongoDB Atlas
    const options = {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
    };

    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful troubleshooting information
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('connect ECONNREFUSED')) {
      console.log('\n🔧 Local MongoDB Connection Issue:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Start MongoDB service: mongod or net start MongoDB');
      console.log('3. Check if MongoDB is running on port 27017');
      console.log('4. For Windows, check Services → MongoDB');
    } else if (error.message?.includes('IP that isn\'t whitelisted')) {
      console.log('\n🔧 IP Whitelist Issue:');
      console.log('1. Go to MongoDB Atlas dashboard: https://cloud.mongodb.com/');
      console.log('2. Navigate to Network Access → IP Whitelist');
      console.log('3. Add your current IP address or use 0.0.0.0/0 (all IPs) for development');
      console.log('4. Try again after the whitelist is updated');
    } else if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      console.log('\n🔧 SSL/TLS Issue:');
      console.log('1. Local MongoDB doesn\'t require SSL by default');
      console.log('2. For Atlas, check if your cluster allows SSL connections');
      console.log('3. Try updating your MongoDB driver: npm update mongodb');
    } else {
      console.log('\n🔧 General Connection Issues:');
      console.log('1. Check your MongoDB URI format');
      console.log('2. Verify database name is correct');
      console.log('3. Ensure MongoDB service is running');
    }
    
    // Don't exit the process, just log the error
    // The app can still run without database for testing routes
    console.log('\n⚠️  Continuing without database connection...');
  }
};

// Handle connection events
mongoose.connection.on('error', (err: Error) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export { connectDB };
