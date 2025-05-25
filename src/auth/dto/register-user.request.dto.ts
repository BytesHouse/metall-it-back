import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class RegisterUserRequest extends OmitType(CreateUserDto, ['hash']) {
  public password: string;
}
