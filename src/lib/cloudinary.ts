import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export type UploadResult = {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

/**
 * Upload a base64 or remote image to Cloudinary
 */
export async function uploadImage(
  file: string, // base64 data URL or remote URL
  folder = "chola-chela/photos"
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
    transformation: [
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    url: result.url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
