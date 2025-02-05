import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createId } from '@paralleldrive/cuid2';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { generateReferral } from 'src/common/libs/generateReferral';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto) {
    const { email, username, password, referralCode } = registerDto;
    const existUser = await this.userService.findOne(email);

    if (existUser) {
      throw new ConflictException('User with this email already exists');
    }

    const userId = createId();
    const pointId = createId();
    const generateReferralCode = generateReferral();
    const hashedPassword = await bcrypt.hash(password, 10);
    const addPointValue = 10000;
    let userReferral: User | null;

    if (referralCode) {
      const refUser = await this.prisma.$queryRaw<User[]>`
        SELECT id, referralCode
        FROM users
        WHERE referralCode = ${referralCode}
        LIMIT 1;
      `;

      if (refUser.length === 0) {
        throw new NotFoundException('Referral code not found');
      }

      userReferral = refUser[0];
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO users (id, username, email, password, referralCode, createdAt, updatedAt)
        VALUES (${userId}, ${username}, ${email}, ${hashedPassword}, ${generateReferralCode}, NOW(), NOW());
       `;

      if (userReferral) {
        const existingPoint = await tx.$queryRaw<{ total: number }[]>`
            SELECT total
            FROM points
            WHERE userId = ${userReferral.id}
            LIMIT 1;
        `;

        if (existingPoint.length > 0) {
          await tx.$executeRaw`
            UPDATE points 
            SET total = total + ${addPointValue}, expiredAt = DATE_ADD(NOW(), INTERVAL 3 MONTH)
            WHERE userId = ${userReferral.id};
          `;
        } else {
          await tx.$executeRaw`
            INSERT INTO points (id, total, userId, expiredAt) 
            VALUES (${pointId}, ${addPointValue}, ${userReferral.id}, DATE_ADD(NOW(), INTERVAL 3 MONTH));
        `;
        }
      }
    });

    const newUser = await this.userService.findOne(email);
    const getUserPoint = userReferral
      ? await this.userService.getUserPoint(userReferral.id)
      : null;

    return {
      message: 'Successfully create new user',
      data: newUser,
      user_point: getUserPoint,
    };
  }

  async login(user: { id: string; email: string; role: string }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
