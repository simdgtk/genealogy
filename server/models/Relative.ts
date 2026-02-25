import { defineMongooseModel } from '#nuxt/mongoose'

export const Relative = defineMongooseModel({
  name: 'Relative',
  schema: {
    surname: { type: String, required: true },
    name: { type: String, required: false },
    gender: { type: String, required: false },
    birthDate: { type: Date, required: false },
    deathDate: { type: Date, required: false },
  }
})