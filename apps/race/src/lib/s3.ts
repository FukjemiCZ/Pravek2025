import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function s3Client() {
  return new S3Client({
    region: process.env.S3_REGION || "eu-central-1",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
    },
    forcePathStyle: true
  });
}

export async function uploadPhoto(input: { objectKey: string; body: Buffer; mimeType: string }) {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is missing.");
  await s3Client().send(new PutObjectCommand({ Bucket: bucket, Key: input.objectKey, Body: input.body, ContentType: input.mimeType }));
  return { bucket, objectKey: input.objectKey };
}

export async function getPhotoViewUrl(objectKey: string) {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET is missing.");
  return getSignedUrl(s3Client(), new GetObjectCommand({ Bucket: bucket, Key: objectKey }), { expiresIn: 60 * 10 });
}
