// authorType.model.ts
import { Schema, model } from "mongoose";
import { EnumTypes } from "../../types/enum.types";

const authorTypesSchema = new Schema<EnumTypes>({
  type: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
});
const AuthorTypes = model<EnumTypes>("AuthorTypes", authorTypesSchema);
export default AuthorTypes;
