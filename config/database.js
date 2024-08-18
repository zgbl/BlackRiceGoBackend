import mongoose from 'mongoose';

let currentDbUri;

const connectDB = async () => {
  //const primaryUri = process.env.MONGO_URI_PRIMARY;
  //const primaryUri = 'mongodb+srv://flyer:Flyer123@blackricemongo.t7k7zg3.mongodb.net/blackrice?retryWrites=true&w=majority';
  //const backupUri = process.env.MONGO_URI_BACKUP;

  /*try {
    await mongoose.connect(primaryUri);
    console.log('Connected to primary MongoDB');
    currentDbUri = primaryUri;
  } catch (error) {
    console.error('Error connecting to primary MongoDB:', error.message);
    console.log('Attempting to connect to backup MongoDB...');
    try {
      await mongoose.connect(backupUri);
      console.log('Connected to backup MongoDB');
      currentDbUri = backupUri;
    } catch (backupError) {
      console.error('Error connecting to backup MongoDB:', backupError.message);
      throw new Error('Failed to connect to both primary and backup databases');
    }
  }  */

  //console.log('Primary MongoDB URI:', primaryUri);  //打印 Github Page 变量排错

  //console.log(process.env.MONGO_URI_PRIMARY);

  /*if (!primaryUri || !primaryUri.startsWith('mongodb')) {
    console.error('Invalid or missing MongoDB URI');
    throw new Error('Failed to connect to primary MongoDB');
  } */
 
  try {
    //await mongoose.connect(primaryUri);
    //await mongoose.connect('mongodb+srv://flyer:Flyer123@blackricemongo.t7k7zg3.mongodb.net/blackrice?retryWrites=true&w=majority');
    await mongoose.connect('mongodb+srv://vercel-admin-user-66c2608b73d51b598b4befb6:vercel-admin-user-66c2608b73d51b598b4befb6@blackricemongo.t7k7zg3.mongodb.net/blackrice?retryWrites=true&w=majority');
    console.log('Connected to primary MongoDB');
    //currentDbUri = primaryUri;

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