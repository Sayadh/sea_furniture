import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ReorderDto {
  /** IDs in the desired display order. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  ids: string[];
}
