import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { generateSlug } from 'src/common/libs/generateSlug';
import { createId } from '@paralleldrive/cuid2';
import { format } from 'date-fns';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async createEvent(data: CreateEventDto) {
    const {
      description,
      endDate,
      image,
      location,
      price,
      startDate,
      time,
      title,
      totalTicket,
      type,
      userId,
    } = data;

    const slugTitle = generateSlug(title);
    const eventId = createId();
    const formattedStartDate = format(
      new Date(startDate),
      'yyyy-MM-dd HH:mm:ss',
    );
    const formattedEndDate = format(new Date(endDate), 'yyyy-MM-dd HH:mm:ss');

    const newEvent = await this.prisma.$executeRaw`
      INSERT INTO events(id, title, slug, price, userId, type, description, endDate, image, location, startDate, time, totalTicket)
      VALUES(${eventId}, ${title}, ${slugTitle}, ${price}, ${userId}, ${type}, ${description}, ${formattedEndDate}, ${image}, ${location}, ${formattedStartDate}, ${time}, ${totalTicket} );
    `;

    return newEvent;
  }
}
