import { Person } from "../models/Person";
import { Family } from "../models/Family";
import { auth, db } from "./auth/auth_file/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  const query = getQuery(event);
  const familyIdQuery = query.familyId;

  try {
    const exampleUser = await db
      .collection("user")
      .findOne({ email: "simondaguetkargl@gmail.com" });

    let familyId = familyIdQuery;

    if (!session && (!familyId || familyId === "undefined")) {
      if (!exampleUser) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
      }
      const exampleFamily = await Family.findOne({
        creatorId: exampleUser._id.toString(),
      });
      if (!exampleFamily) {
        throw createError({
          statusCode: 404,
          statusMessage: "Example family not found",
        });
      }
      familyId = exampleFamily._id.toString();
    } else if (!familyId || familyId === "undefined") {
      throw createError({
        statusCode: 400,
        statusMessage: "familyId is required",
      });
    }

    const family = await Family.findById(familyId);
    if (!family) {
      throw createError({
        statusCode: 404,
        statusMessage: "Family not found",
      });
    }

    const isExampleFamily =
      exampleUser && family.creatorId === exampleUser._id.toString();

    if (!session && !isExampleFamily) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    if (!isExampleFamily) {
      const isCreator = session && family.creatorId === session.user.id;
      const isShared =
        session &&
        (family.sharedWith as any[])?.some(
          (share: any) => share.userId === session.user.id,
        );

      if (!isCreator && !isShared) {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden to view this family",
        });
      }
    }

    const persons = await Person.find({ familyId }).exec();
    return persons;
  } catch (error: any) {
    console.error("Error fetching persons:", error);
    throw createError({
      statusCode: error.statusCode || 400,
      statusMessage: error.statusMessage || "Person could not be found",
      data: { message: error.message, stack: error.stack },
    });
  }
});
