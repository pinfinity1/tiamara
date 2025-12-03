import cloudinary from "../config/cloudinary";
import fs from "fs";

interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = async (
  fileSource: string,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<UploadResult> => {
  try {
    const result = await cloudinary.uploader.upload(fileSource, {
      folder: folder,
      resource_type: resourceType,
    });

    if (!fileSource.startsWith("http") && fs.existsSync(fileSource)) {
      fs.unlinkSync(fileSource);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    if (!fileSource.startsWith("http") && fs.existsSync(fileSource)) {
      fs.unlinkSync(fileSource);
    }
    throw error;
  }
};

export const deleteFromCloudinary = async (
  publicId: string | null | undefined,
  resourceType: "image" | "video" = "image"
) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete ${publicId} from Cloudinary:`, error);
  }
};

export const deleteManyFromCloudinary = async (publicIds: string[]) => {
  if (!publicIds || publicIds.length === 0) return;
  try {
    await cloudinary.api.delete_resources(publicIds);
    console.log(`Deleted ${publicIds.length} images from Cloudinary`);
  } catch (error) {
    console.error("Failed to delete multiple images:", error);
  }
};
