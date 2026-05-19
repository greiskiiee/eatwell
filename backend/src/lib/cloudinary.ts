import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function ensureConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadImageBuffer(
  buffer: Buffer,
  mimetype: string,
  folder: string,
): Promise<string> {
  ensureConfigured();

  const result = await cloudinary.uploader.upload(
    `data:${mimetype};base64,${buffer.toString("base64")}`,
    {
      folder,
      resource_type: "image",
    },
  );

  return result.secure_url;
}

export async function uploadFileBuffer(
  buffer: Buffer,
  mimetype: string,
  folder: string,
): Promise<string> {
  ensureConfigured();

  if (mimetype === "application/pdf") {
    const result = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${buffer.toString("base64")}`,
      { folder, resource_type: "raw" },
    );
    return result.secure_url;
  }

  return uploadImageBuffer(buffer, mimetype, folder);
}

export { cloudinary };
