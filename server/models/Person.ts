import { defineMongooseModel } from '#nuxt/mongoose'
import { Schema } from 'mongoose'

export const Person = defineMongooseModel({
  name: 'Person',
  schema: {
    surname: { type: String, required: true },
    name: { type: String, required: false },
    birthDate: { type: Date, required: false },
    deathDate: { type: Date, required: false },
    gender: { type: String, required: false },
    parent1Id: { type: Schema.Types.ObjectId, ref: 'Person', default: null },
    parent2Id: { type: Schema.Types.ObjectId, ref: 'Person', default: null }
  }
})