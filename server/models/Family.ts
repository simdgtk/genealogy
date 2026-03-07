import { defineMongooseModel } from "#nuxt/mongoose";

export const Family = defineMongooseModel({
  name: "Family",
  schema: {
    name: { type: String, required: true },
    creatorId: { type: String, required: true },
    sharedWith: [
      {
        userId: { type: String, required: true },
        email: { type: String, required: true },
        canEdit: { type: Boolean, default: false },
      },
    ],
  },
});
