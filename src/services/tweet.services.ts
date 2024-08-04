import { ObjectId } from 'mongodb';

import { TweetRequestBody } from '@/models/requests/Tweet.requests';
import Tweet from '@/models/schemas/Tweet.schema';

import databaseService from './database.services';

class TweetService {
  async createTweet(user_id: string, payload: TweetRequestBody) {
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        ...payload,
        hashtags: [],
        user_id: new ObjectId(user_id),
      }),
    );

    return result;
  }
}

const tweetService = new TweetService();

export default tweetService;
