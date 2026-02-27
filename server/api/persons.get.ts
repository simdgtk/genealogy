import { Person } from "../models/Person";

export default defineEventHandler(async (event) => {
  try {
    Person;
    const persons = await Person.find({_id: { $ne: null } }).exec();
    return persons;
  } catch (error: any) {
    console.error("Error fetching persons:", error);
    throw createError({
      statusCode: 400,
      statusMessage: "Person could not be found",
      data: { message: error.message, stack: error.stack },
    });
  }
});
