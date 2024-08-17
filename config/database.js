import mongoose from 'mongoose';

let currentDbUri;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI_PRIMARY;
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

  try {
    await mongoose.connect(primaryUri);
    console.log('Connected to primary MongoDB');
    currentDbUri = primaryUri;

    // 连接成功后，列出所有集合
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
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