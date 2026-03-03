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
  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Family name is required",
    });
  }

  try {
    const newFamily = await Family.create({
      name: body.name,
      creatorId: session.user.id,
    });
    return newFamily;
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: "Family could not be created",
      data: error.message,
    });
  }
});
