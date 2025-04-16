import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import TokenModel from '../models/token-model';

interface CustomTokenPayload {
   user: Types.ObjectId; // Змінено на Types.ObjectId
   refreshToken: string;
   [key: string]: any;
}

class TokenService {
   generateTokens(payload: CustomTokenPayload): { accessToken: string; refreshToken: string } {
      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '30m' });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '60m' });
      return { accessToken, refreshToken };
   }

   validateAccessToken(token: string): CustomTokenPayload | null {
      try {
         const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as CustomTokenPayload;
         return userData;
      } catch (e) {
         return null;
      }
   }

   validateRefreshToken(token: string): CustomTokenPayload | null {
      try {
         const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as CustomTokenPayload;
         return userData;
      } catch (e) {
         return null;
      }
   }

   async saveToken(userID: Types.ObjectId, refreshToken: string): Promise<any> {
      const tokenData = await TokenModel.findOne({ user: userID });
      if (tokenData) {
         tokenData.refreshToken = refreshToken;
         return tokenData.save();
      }
      const token = await TokenModel.create({ user: userID, refreshToken });
      return token;
   }

   async removeToken(refreshToken: string): Promise<{ deletedCount?: number }> {
      const tokenData = await TokenModel.deleteOne({ refreshToken });
      return tokenData;
   }

   async findToken(refreshToken: string): Promise<any | null> {
      const tokenData = await TokenModel.findOne({ refreshToken });
      return tokenData;
   }
}

export default new TokenService();