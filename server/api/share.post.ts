import { auth } from "./auth/auth_file/auth";
import { Family } from "../models/Family";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI || "");
const db = client.db();
const usersCollection = db.collection("user");

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
  const { familyId, email, canEdit } = body;

  if (!familyId || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: "familyId and email are required",
    });
  }

  try {
    const family = await Family.findById(familyId);
    if (!family || family.creatorId !== session.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden. Only the creator can share the family.",
      });
    }

    // Find the user by email using plain MongoDB
    const targetUser = await usersCollection.findOne({ email });
    if (!targetUser) {
      throw createError({
        statusCode: 404,
        statusMessage:
          "User with this email not found. They must sign up first.",
      });
    }

    const targetUserId = targetUser._id.toString(); // or targetUser.id depending on better-auth

    // better-auth uses string id field usually, let's get it:
    const finalTargetId = targetUser.id || targetUser._id.toString();

    if (finalTargetId === session.user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: "You cannot share the family with yourself.",
      });
    }

    // Check if already shared
    const isAlreadyShared = (family.sharedWith as any[])?.some(
      (share: any) => share.userId === finalTargetId,
    );

    if (isAlreadyShared) {
      throw createError({
        statusCode: 400,
        statusMessage: "Family is already shared with this user.",
      });
    }

    // Add to sharedWith
    family.sharedWith.push({
      userId: finalTargetId,
      email: email,
      canEdit: canEdit || false,
    } as any);

    await family.save();

    return { message: "Successfully shared", sharedWith: family.sharedWith };
  } catch (error: any) {
    console.error("Error sharing family:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Could not share family",
      data: error.message,
    });
  }
});
