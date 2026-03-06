import { Family } from "../models/Family";
import { auth, db } from "./auth/auth_file/auth";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  const query = getQuery(event);
  const id = query.id;

  if (!id || id === "undefined") {
    throw createError({
      statusCode: 400,
      statusMessage: "id is required",
    });
  }

  try {
    const family = await Family.findById(id);
    if (!family) {
      throw createError({
        statusCode: 404,
        statusMessage: "Family not found",
      });
    }

    const exampleUser = await db
      .collection("user")
      .findOne({ email: "simondaguetkargl@gmail.com" });
    const isExampleFamily =
      exampleUser && family.creatorId === exampleUser._id.toString();

    if (!session && !isExampleFamily) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    if (isExampleFamily) {
      return family;
    }

    const isCreator = session && family.creatorId === session.user.id;
    const isShared =
      session &&
      (family.sharedWith as any[])?.some(
        (share: any) => share.userId === session.user.id,
      );

    if (!isCreator && !isShared) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden. You do not have access to this family.",
      });
    }

    return family;
  } catch (error: any) {
    console.error("Error fetching family:", error);
    throw createError({
      statusCode: error.statusCode || 400,
      statusMessage: error.statusMessage || "Family could not be fetched",
      data: error.message,
    });
  }
});
