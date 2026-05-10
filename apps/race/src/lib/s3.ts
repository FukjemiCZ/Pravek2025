import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export function s3Client() {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "eu-central-1",
    credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY }
      : undefined
  });
}

export function s3Bucket() {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("Missing S3_BUCKET");
  return bucket;
}

export async function putPhotoObject(input: { objectKey: string; body: Buffer; contentType: string }) {
  await s3Client().send(new PutObjectCommand({
    Bucket: s3Bucket(),
    Key: input.objectKey,
    Body: input.body,
    ContentType: input.contentType
  }));
}
