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
  const { familyId, userId, canEdit } = body;

  if (!familyId || !userId || canEdit === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: "familyId, userId, and canEdit are required",
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

    const shareIndex = (family.sharedWith as any[]).findIndex(
      (share: any) => share.userId === userId,
    );

    if (shareIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: "User is not in the shared list.",
      });
    }

    // Update permission
    (family.sharedWith as any[])[shareIndex].canEdit = canEdit;

    // Mark modified to ensure Mongoose saves the array mutation
    family.markModified("sharedWith");
    await family.save();

    return {
      message: "Successfully updated share permissions",
      sharedWith: family.sharedWith,
    };
  } catch (error: any) {
    console.error("Error updating family share:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Could not update share",
      data: error.message,
    });
  }
});
