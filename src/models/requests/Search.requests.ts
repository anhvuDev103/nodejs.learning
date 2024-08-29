import { PaginationRequestQueries } from './Common.requests';

export interface SearchQueries extends PaginationRequestQueries {
  content: string;
}
