import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { JoinRequestDto } from './dto/join.request.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUser(@Req() req) {
    return req.user;
  }

  @Post()
  postUsers(@Body() body: JoinRequestDto) {
    this.usersService.postUser(body.email, body.nickname, body.password);
  }

  @Post('login')
  login(@Req() req) {
    return req.user;
  }

  @Post('logout')
  logout(@Req() req, @Res() res) {
    req.logOut();
    res.clearCookie('connect.sid', { httpOnly: true });
    res.send('ok');
  }
}
