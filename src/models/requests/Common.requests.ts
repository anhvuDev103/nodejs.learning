import { ParsedQs } from 'qs';

export interface PaginationRequestQueries extends ParsedQs {
  limit: string;
  page: string;
}
