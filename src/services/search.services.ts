import { ObjectId, WithId } from 'mongodb';

import { TweetAudience, TweetType } from '@/constants/enums';
import { SearchQueries } from '@/models/requests/Search.requests';
import Tweet from '@/models/schemas/Tweet.schema';

import databaseService from './database.services';

class SearchService {
  async search({ user_id, content, limit, page }: { user_id: string; content: string; limit: number; page: number }) {
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              $text: {
                $search: content,
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'author',
            },
          },
          {
            $unwind: {
              path: '$author',
            },
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone,
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle,
                    },
                    {
                      'author.twitter_circle': {
                        $in: [new ObjectId(user_id)],
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions',
            },
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    username: '$$mention.username',
                    email: '$$mention.email',
                  },
                },
              },
            },
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks',
            },
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes',
            },
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children',
            },
          },
          {
            $addFields: {
              bookmarks: {
                $size: '$bookmarks',
              },
              likes: {
                $size: '$likes',
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Retweet],
                    },
                  },
                },
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Comment],
                    },
                  },
                },
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.QuoteTweet],
                    },
                  },
                },
              },
            },
          },
          {
            $project: {
              tweet_children: 0,
              author: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0,
              },
            },
          },
          {
            $skip: limit * (page - 1),
          },
          {
            $limit: limit,
          },
        ])
        .toArray() as Promise<Tweet[]>,

      databaseService.tweets
        .aggregate([
          {
            $match: {
              $text: {
                $search: content,
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'author',
            },
          },
          {
            $unwind: {
              path: '$author',
            },
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone,
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle,
                    },
                    {
                      'author.twitter_circle': {
                        $in: [new ObjectId(user_id)],
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    username: '$$mention.username',
                    email: '$$mention.email',
                  },
                },
              },
            },
          },
          {
            $project: {
              tweet_children: 0,
              author: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0,
              },
            },
          },
          {
            $count: 'total',
          },
        ])
        .toArray(),
    ]);

    const tweet_ids = tweets.map((tweet) => tweet._id);

    const date = new Date();

    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids,
        },
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date,
        },
      },
    );

    tweets.forEach((tweet) => {
      tweet.updated_at = date;
      tweet.user_views += 1;
    });

    return { tweets, total: total[0].total };
  }
}

const searchService = new SearchService();

export default searchService;
