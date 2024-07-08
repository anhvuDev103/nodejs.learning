import { Collection, Db, MongoClient } from 'mongodb';

import User from '@/models/schemas/User.schema';

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
}

const databaseService = new DatabaseService();

export default databaseService;
