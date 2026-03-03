import { defineMongooseModel } from "#nuxt/mongoose";

export const Family = defineMongooseModel({
  name: "Family",
  schema: {
    name: { type: String, required: true },
    creatorId: { type: String, required: true }, // Better Auth User ID
  },
});
