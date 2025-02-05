import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | undefined> {
    const user = await this.prisma.$queryRaw<User[]>`
    SELECT id, username, email, password, referralCode, role 
    FROM users
    WHERE email = ${email}
    LIMIT 1
    `;

    console.log('FIND ONE', user);

    return user && user.length > 0 ? user[0] : null;
  }

  async getUserPoint(userId: string) {
    const userPoint = await this.prisma.$queryRaw<[]>`
    SELECT u.email, u.referralCode, p.total, p.expiredAt
    FROM users u
    INNER JOIN points p ON u.id = p.userId
    WHERE u.id = ${userId};
    `;

    if (!userPoint || userPoint.length === 0) {
      console.log('USER POINT', userPoint);
    }

    return userPoint;
  }
}
