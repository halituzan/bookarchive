// user.model.ts
import { Date, Document, Schema, model } from "mongoose";

interface IUser extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  birthDate: Date | null;
  gender: number | null;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  birthDate: { type: Date, default: null },
  gender: { type: Number, default: null },
});

const Users = model<IUser>("Users", userSchema);
export default Users;
