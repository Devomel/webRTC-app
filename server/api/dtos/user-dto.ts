import { Types } from 'mongoose';
import { IUser } from '../models/user-model';

export default class UserDto {
   email: string;
   id: Types.ObjectId;
   isActivated: boolean;
   username: string;
   constructor(model: Omit<IUser, "password"> & { _id: Types.ObjectId }) {
      this.email = model.email;
      this.id = model._id;
      this.isActivated = model.isActivated;
      this.username = model.username
   }
} 
