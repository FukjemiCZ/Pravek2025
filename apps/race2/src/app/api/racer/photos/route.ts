import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { uploadPhoto } from "@/lib/s3";
import { appendRaceEvent } from "@/lib/state";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") || "");
  const checkpointId = String(form.get("checkpointId") || "") || undefined;
  const caption = String(form.get("caption") || "") || undefined;
  const file = form.get("file");
  if (!token || !(file instanceof File)) return jsonError("Chybí token nebo soubor.", 400);
  if (!allowed.has(file.type)) return jsonError("Povoleny jsou jen JPG, PNG a WebP fotky.", 400);
  if (file.size > 10 * 1024 * 1024) return jsonError("Fotka je větší než 10 MB.", 400);

  const racer = await prisma.racer.findUnique({ where: { publicAccessToken: token } });
  if (!racer) return jsonError("Závodník nebyl nalezen.", 404);

  const photoId = randomUUID();
  const extension = extname(file.name) || (file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg");
  const objectKey = `races/${racer.raceId}/racers/${racer.id}/photos/${photoId}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadPhoto({ objectKey, body: buffer, mimeType: file.type });

  const photo = await prisma.racerPhoto.create({ data: { id: photoId, raceId: racer.raceId, racerId: racer.id, checkpointId, type: checkpointId ? "CHECKPOINT" : "FREE", bucket: uploaded.bucket, objectKey: uploaded.objectKey, originalFileName: file.name, mimeType: file.type, sizeBytes: file.size, caption } });
  await appendRaceEvent({ raceId: racer.raceId, racerId: racer.id, checkpointId, type: "PHOTO_UPLOADED", payload: { photoId: photo.id, type: photo.type } });
  return NextResponse.json({ photo });
}
