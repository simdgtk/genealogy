import { Person } from "../models/Person";
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
  try {
    const person = await Person.findById(body.id);
    if (!person) {
      throw createError({
        statusCode: 404,
        statusMessage: "Personne non trouvée",
      });
    }

    if (!person.familyId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cette personne n'est rattachée à aucune famille",
      });
    }

    const family = await Family.findById(person.familyId);
    if (!family) {
      throw createError({
        statusCode: 404,
        statusMessage: "Family not found",
      });
    }

    const isCreator = family.creatorId === session.user.id;
    const isEditor = (family.sharedWith as any[])?.some(
      (share: any) => share.userId === session.user.id && share.canEdit,
    );

    if (!isCreator && !isEditor) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "Vous n'avez pas la permission de supprimer cette personne",
      });
    }

    const deletedPerson = await Person.findByIdAndDelete(body.id);
    return deletedPerson;
  } catch (error: any) {
    console.error("Error deleting person:", error);
    throw createError({
      statusCode: 400,
      statusMessage: error.statusMessage || "Person could not be deleted",
      data: { message: error.message, stack: error.stack },
    });
  }
});
