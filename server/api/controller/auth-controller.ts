import { Request, Response, NextFunction } from 'express';
import userService from '../service/user-service';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/api-error';

class UserController {
   async registration(req: Request, res: Response, next: NextFunction) {
      try {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return next(ApiError.BadRequest('Validation error', errors.array()));
         }
         const { email, password, username } = req.body;
         const userData = await userService.registration(email, password, username);
         res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 1000, httpOnly: true });
         return res.json(userData);
      } catch (e) {
         next(e);
      }
   }

   async login(req: Request, res: Response, next: NextFunction) {
      try {
         console.log(1)
         const { email, password } = req.body;
         const userData = await userService.login(email, password);
         res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 1000, httpOnly: true });
         return res.json(userData);
      } catch (e) {
         next(e);
      }
   }

   async logout(req: Request, res: Response, next: NextFunction) {
      try {
         const { refreshToken } = req.cookies;
         const token = await userService.logout(refreshToken);
         res.clearCookie('refreshToken');
         return res.json(token);
      } catch (e) {
         next(e);
      }
   }

   async activate(req: Request, res: Response, next: NextFunction) {
      try {
         const activationLink = req.params.link;
         await userService.activate(activationLink);
         return res.redirect(process.env.CLIENT_URL || '/');
      } catch (e) {
         next(e);
      }
   }

   async refresh(req: Request, res: Response, next: NextFunction) {
      try {
         const { refreshToken } = req.cookies;
         const userData = await userService.refresh(refreshToken);
         res.cookie('refreshToken', userData.refreshToken, { maxAge: 60 * 1000, httpOnly: true });
         return res.json(userData);
      } catch (e) {
         next(e);
      }
   }

   // async validateAccessToken
}

export default new UserController();