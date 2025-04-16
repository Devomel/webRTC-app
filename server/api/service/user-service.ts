import UserModel from '../models/user-model';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import mailService from './mail-service';
import tokenService from './token-service';
import UserDto from '../dtos/user-dto';
import ApiError from '../exceptions/api-error';
import { Types } from 'mongoose';

interface Tokens {
   accessToken: string;
   refreshToken: string;
}

class UserService {
   async registration(email: string, password: string, username: string) {
      const candidate = await UserModel.findOne({ email });
      if (candidate) {
         throw ApiError.BadRequest(`User with email: ${email} already exists`);
      }

      const hashPassword = await bcrypt.hash(password, 7);
      const activationLink = uuidv4();
      const defaultRole = 'USER';

      const user = await UserModel.create({ email, password: hashPassword, role: defaultRole, activationLink, username });
      await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

      const userDto = new UserDto({
         email: user.email,
         username: user.username,
         _id: user._id,
         isActivated: user.isActivated,
      });

      const tokens: Tokens = tokenService.generateTokens({
         user: userDto.id,
         refreshToken: '',
      });

      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return { ...tokens, user: userDto };
   }

   async activate(activationLink: string) {
      const user = await UserModel.findOne({ activationLink });
      if (!user) {
         throw ApiError.BadRequest('Incorrect activation link');
      }
      user.isActivated = true;
      await user.save();
   }

   async login(email: string, password: string) {
      const user = await UserModel.findOne({ email });
      if (!user) {
         throw ApiError.BadRequest('User not found');
      }

      const isPassEquals = await bcrypt.compare(password, user.password);
      if (!isPassEquals) {
         throw ApiError.BadRequest('Wrong password');
      }

      const userDto = new UserDto({
         email: user.email,
         username: user.username,
         _id: user._id,
         isActivated: user.isActivated,
      });


      const tokens: Tokens = tokenService.generateTokens({
         user: userDto.id,
         refreshToken: '', // Потрібно згенерувати refreshToken
      });

      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return { ...tokens, user: userDto };
   }

   async logout(refreshToken: string) {
      const token = await tokenService.removeToken(refreshToken);
      return token;
   }

   async refresh(refreshToken: string) {
      if (!refreshToken) {
         throw ApiError.UnauthorizedError();
      }

      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await tokenService.findToken(refreshToken);
      if (!userData || !tokenFromDb) {
         throw ApiError.UnauthorizedError();
      }

      const user = await UserModel.findById(userData.user);
      if (!user) {
         throw ApiError.UnauthorizedError();
      }

      const userDto = new UserDto({
         email: user.email,
         username: user.username,
         _id: user._id,
         isActivated: user.isActivated,
      });

      const tokens: Tokens = tokenService.generateTokens({
         user: userDto.id,
         refreshToken: '',
      });

      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return { ...tokens, user: userDto };
   }

   async getAllUsers() {
      const users = await UserModel.find();
      return users;
   }
}

export default new UserService();