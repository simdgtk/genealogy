import { Person } from "../models/Person";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const familyId = query.familyId;

  try {
    const filter: any = { _id: { $ne: null } };
    if (familyId && familyId !== "undefined") {
      filter.familyId = familyId;
    } else if (familyId === "undefined") {
      throw createError({
        statusCode: 400,
        statusMessage: "familyId is undefined",
      });
    }

    const persons = await Person.find(filter).exec();
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
