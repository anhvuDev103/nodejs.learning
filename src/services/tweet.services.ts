import { ObjectId, WithId } from 'mongodb';

import { TweetRequestBody } from '@/models/requests/Tweet.requests';
import Hashtag from '@/models/schemas/Hashtag.schema';
import Tweet from '@/models/schemas/Tweet.schema';

import databaseService from './database.services';

class TweetService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag,
          },
          {
            $setOnInsert: new Hashtag({ name: hashtag }),
          },
          {
            upsert: true,
            returnDocument: 'after',
          },
        );
      }),
    );

    return hashtagDocuments.map((hashtagDocument) => (hashtagDocument as WithId<Hashtag>)._id);
  }

  async createTweet(user_id: string, payload: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(payload.hashtags);
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        ...payload,
        hashtags,
        user_id: new ObjectId(user_id),
      }),
    );

    return result;
  }
}

const tweetService = new TweetService();

export default tweetService;
