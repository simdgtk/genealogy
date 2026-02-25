import { Person } from "../models/Person";
import { Relative } from "../models/Relative";

export default defineEventHandler(async (event) => {
  try {
    Relative;
    const persons = await Person.find().populate("relativeId");
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
