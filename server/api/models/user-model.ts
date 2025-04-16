import { Schema, model } from 'mongoose';

export interface IUser {
   email: string;
   password: string;
   isActivated: boolean;
   activationLink?: string;
   username: string;
}

const UserSchema = new Schema<IUser>({
   email: { type: String, unique: true, required: true },
   password: { type: String, required: true },
   isActivated: { type: Boolean, default: false },
   activationLink: { type: String },
   username: { type: String, required: true }
});

const UserModel = model<IUser>('User', UserSchema);

export default UserModel;