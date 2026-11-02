import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ToInt } from '../utils/transforms';

export class PaginationQueryDto {
  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function paginate<T>(items: T[], total: number, page: number, limit: number): Paginated<T> {
  return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
}
