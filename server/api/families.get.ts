import { auth } from "./auth/auth_file/auth";
import { Family } from "../models/Family";

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: toWebRequest(event).headers,
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  try {
    const families = await Family.find({ creatorId: session.user.id }).exec();
    return families;
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Could not fetch families",
      data: error.message,
    });
  }
});
