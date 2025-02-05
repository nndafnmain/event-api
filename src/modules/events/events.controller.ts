import { Body, Controller, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('events')
export class EventsController {
  constructor(
    private eventService: EventsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  async createEvent(@Body() dto: CreateEventDto) {
    const event = this.eventService.createEvent(dto);
    const getEvent = this.prisma.$queryRaw`
    SELECT *
    FROM events
    WHERE title = ${dto.title}
    `;
    return {
      message: 'success',
      data: {
        event,
        getEvent,
      },
    };
  }
}
