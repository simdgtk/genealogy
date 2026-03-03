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
          throw new Error("Erreur lors du traitement de l'image");
        }
      } else if (field.name) {
        personData[field.name] = field.data.toString("utf-8");
      }
    }

    if (mediaUrl) {
      personData.mediaUrl = mediaUrl;
    }

    if (!personData.familyId) {
      throw createError({
        statusCode: 400,
        statusMessage: "familyId est requis",
      });
    }

    const family = await Family.findById(personData.familyId);
    if (!family || family.creatorId !== session.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage:
          "Vous n'avez pas la permission d'ajouter des personnes à cette famille",
      });
    }

    const newPerson = await Person.create(personData);
    return newPerson;
  } catch (error) {
    console.error("ERREUR CRÉATION :", error);
    throw createError({
      statusCode: 400,
      statusMessage: "Person could not be created",
    });
  }
});
