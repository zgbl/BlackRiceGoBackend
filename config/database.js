import mongoose from 'mongoose';

let currentDbUri;

const connectDB = async () => {
  //const primaryUri = process.env.MONGO_URI_PRIMARY;
  const primaryUri = 'mongodb+srv://flyer:Flyer123@blackricemongo.t7k7zg3.mongodb.net/blackrice?retryWrites=true&w=majority';
 
  try {
    //await mongoose.connect(primaryUri);
    await mongoose.connect('mongodb+srv://flyer:Flyer123@blackricemongo.t7k7zg3.mongodb.net/blackrice?retryWrites=true&w=majority');
    //await mongoose.connect('mongodb+srv://vercel-admin-user-66c2608b73d51b598b4befb6:vercel-admin-user-66c2608b73d51b598b4befb6@blackricemongo.t7k7zg3.mongodb.net/blackrice?retryWrites=true&w=majority');
    console.log('Connected to primary MongoDB');
    currentDbUri = primaryUri;

    // 连接成功后，列出所有集合
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('MongoDB connected successfully');
    console.log('Collections in database:', collections.map(c => c.name));

    // 尝试查询 Posts 集合
    const postsCount = await db.collection('Posts').countDocuments();
    console.log(`Number of documents in Posts collection: ${postsCount}`);

  } catch (error) {
    console.error('Error connecting to primary MongoDB:', error.message);
    throw new Error('Failed to connect to primary MongoDB');
  }
};

const getCurrentDbUri = () => currentDbUri;

export { connectDB, getCurrentDbUri };