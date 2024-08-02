import { Collection, Db, MongoClient } from 'mongodb';

import Follower from '@/models/schemas/Follower.schema';
import RefreshToken from '@/models/schemas/RefreshToken.schema';
import User from '@/models/schemas/User.schema';
import VideoStatus from '@/models/schemas/VideoStatus.schema';

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@nodejs.bdofct8.mongodb.net/?retryWrites=true&w=majority&appName=nodejs`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_DATABASE_NAME);
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 });
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION_NAME as string);
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION_NAME as string);
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION_NAME as string);
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION_NAME as string);
  }

  indexUsers() {
    this.users.createIndex({ email: 1, password: 1 });
    this.users.createIndex(
      { email: 1 },
      {
        unique: true,
      },
    );
    this.users.createIndex(
      { username: 1 },
      {
        unique: true,
      },
    );
  }
}

const databaseService = new DatabaseService();

export default databaseService;
