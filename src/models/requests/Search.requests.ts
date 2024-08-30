import { MediaTypeQuery } from '@/constants/enums';

import { PaginationRequestQueries } from './Common.requests';

export interface SearchQueries extends PaginationRequestQueries {
  content: string;
  media_type: MediaTypeQuery;
}
