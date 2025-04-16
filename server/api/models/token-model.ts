import { Schema, model, Document, Types } from 'mongoose';

export interface IToken extends Document {
    user: Types.ObjectId;
    refreshToken: string;
}

const TokenSchema = new Schema<IToken>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true }
});

const TokenModel = model<IToken>('Token', TokenSchema);

export default TokenModel;