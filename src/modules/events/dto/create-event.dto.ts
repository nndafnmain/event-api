import {
  IsString,
  IsInt,
  IsEnum,
  IsDateString,
  Min,
  Matches,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

enum TicketType {
  FREE = 'FREE',
  PAID = 'PAID',
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  slug: string;

  @IsString()
  image: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsString()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'time must be in HH:mm format',
  })
  time: string;

  @IsString()
  location: string;

  @IsInt()
  @Min(1)
  totalTicket: number;

  @IsEnum(TicketType)
  @IsOptional()
  type: TicketType;

  @IsString()
  userId: string;
}
