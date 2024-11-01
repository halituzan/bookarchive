// book.model.ts
import { Schema, model } from "mongoose";
import { EnumTypes } from "../../types/enum.types";

const publisherTypesSchema = new Schema<EnumTypes>({
  type: { type: String, required: true },
  name: { type: String, required: true, lowercase: true },
  url: { type: String, required: true },
});
const PublisherTypes = model<EnumTypes>("PublisherTypes", publisherTypesSchema);
export default PublisherTypes;
