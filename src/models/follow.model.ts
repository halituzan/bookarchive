// follow.model.ts
import mongoose, { Schema, Document } from "mongoose";

interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  isDeleted: boolean; // Soft delete için flag
  deletedAt?: Date; // Silinme zamanı
}

const followSchema = new Schema<IFollow>({
  follower: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  following: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
});

const Follows = mongoose.model<IFollow>("Follows", followSchema);
export default Follows;
