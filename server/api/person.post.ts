import { Person } from "../models/Person";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const newPerson = await Person.create(body);
    return newPerson;
  } catch (error: any) {
    console.error("Error creating person:", error);
    throw createError({
      statusCode: 400,
      statusMessage: "Person could not be created",
      data: { message: error.message, stack: error.stack },
    });
  }
});
