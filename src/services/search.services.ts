import { ObjectId, WithId } from 'mongodb';

import { SearchQueries } from '@/models/requests/Search.requests';

import databaseService from './database.services';

class SearchService {
  async search({ content, limit, page }: { content: string; limit: number; page: number }) {
    const result = await databaseService.tweets
      .find({
        $text: {
          $search: content,
        },
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray();

    return result;
  }
}

const searchService = new SearchService();

export default searchService;
