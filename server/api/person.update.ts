import { readMultipartFormData } from "h3";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import { Person } from "../models/Person";
import { auth } from "./auth/auth_file/auth";
import { Family } from "../models/Family";

export default defineEventHandler(async (event) => {
  try {
    const session = await auth.api.getSession({
      headers: event.headers,
    });

    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const formData = await readMultipartFormData(event);
    if (!formData) throw new Error("Aucune donnée reçue");

    const personData: any = {};
    let mediaUrl = null;
    let personId = null;

    for (const field of formData) {
      if (field.name === "image" && field.filename) {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const baseName =
          field.filename.split(".").slice(0, -1).join(".") || field.filename;
        const finalFilename = `${Date.now()}-${baseName}.webp`;
        const finalPath = path.join(uploadDir, finalFilename);

        try {
          execSync(
            `magick - -resize "700x700>" -quality 80 webp:"${finalPath}"`,
            { input: field.data },
          );
          mediaUrl = `/uploads/${finalFilename}`;
        } catch (magickError) {
          console.error("Erreur ImageMagick :", magickError);
          // If magick fails, we might want to still continue without the image or throw
          throw new Error("Erreur lors du traitement de l'image");
        }
      } else if (field.name === "id") {
        personId = field.data.toString("utf-8");
      } else if (field.name) {
        personData[field.name] = field.data.toString("utf-8");
      }
    }

    if (!personId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID manquant pour la mise à jour",
      });
    }

    if (mediaUrl) {
      personData.mediaUrl = mediaUrl;
    }

    const person = await Person.findById(personId);
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
    if (!family || family.creatorId !== session.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "Vous n'avez pas la permission de modifier cette personne",
      });
    }

    const updatedPerson = await Person.findByIdAndUpdate(personId, personData, {
      new: true,
    });

    if (!updatedPerson) {
      throw createError({
        statusCode: 404,
        statusMessage: "Personne non trouvée",
      });
    }

    return updatedPerson;
  } catch (error: any) {
    console.error("ERREUR MISE À JOUR :", error);
    throw createError({
      statusCode: 400,
      statusMessage: error.statusMessage || "Person could not be updated",
    });
  }
});
