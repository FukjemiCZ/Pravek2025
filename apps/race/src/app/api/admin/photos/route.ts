import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { guarded } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getPhotoViewUrl } from "@/lib/s3";

export async function GET(request: Request) {
  return guarded(async () => {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const raceId = params.get("raceId") || undefined;
    const photos = await prisma.racerPhoto.findMany({ where: { raceId }, include: { racer: true, checkpoint: true }, orderBy: { createdAt: "desc" }, take: 100 });
    const withUrls = await Promise.all(photos.map(async (photo) => ({ ...photo, viewUrl: await getPhotoViewUrl(photo.objectKey) })));
    return NextResponse.json({ photos: withUrls });
  });
}
