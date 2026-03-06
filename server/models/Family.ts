import { defineMongooseModel } from "#nuxt/mongoose";

export const Family = defineMongooseModel({
  name: "Family",
  schema: {
    name: { type: String, required: true },
    creatorId: { type: String, required: true }, // Better Auth User ID
    sharedWith: [
      {
        userId: { type: String, required: true },
        email: { type: String, required: true },
        canEdit: { type: Boolean, default: false },
      },
    ],
  },
});
