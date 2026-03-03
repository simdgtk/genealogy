import { Person } from "../models/Person";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    const deletedPerson = await Person.findByIdAndDelete(body.id);
    if (!deletedPerson) {
      throw new Error("Person not found");
    }
    return deletedPerson;
  } catch (error: any) {
    console.error("Error deleting person:", error);
    throw createError({
      statusCode: 400,
      statusMessage: "Person could not be deleted",
      data: { message: error.message, stack: error.stack },
    });
  }
});
