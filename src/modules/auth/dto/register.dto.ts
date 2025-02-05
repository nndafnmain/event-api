import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsIn(['CUSTOMER', 'ORGANIZER'])
  @IsString()
  @IsOptional()
  role: string;

  @IsString()
  @IsOptional()
  referralCode: string;
}
