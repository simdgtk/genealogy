import { auth } from "./auth/auth_file/auth";
import { Family } from "../models/Family";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const body = await readBody(event);
  const { familyId, userId } = body;

  if (!familyId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "familyId and userId are required",
    });
  }

  try {
    const family = await Family.findById(familyId);
    if (!family || family.creatorId !== session.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden. Only the creator can modify shares.",
      });
    }

    // Filter out the user
    family.sharedWith = (family.sharedWith as any[]).filter(
      (share: any) => share.userId !== userId,
    ) as any;

    await family.save();

    return {
      message: "Successfully removed share",
      sharedWith: family.sharedWith,
    };
  } catch (error: any) {
    console.error("Error removing family share:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Could not remove share",
      data: error.message,
    });
  }
});
