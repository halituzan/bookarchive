// book.model.ts
import { Schema, model } from "mongoose";
import { EnumTypes } from "../../types/enum.types";

const bookTypesSchema = new Schema<EnumTypes>({
  type: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
});
const BookTypes = model<EnumTypes>("BookTypes", bookTypesSchema);
export default BookTypes;
