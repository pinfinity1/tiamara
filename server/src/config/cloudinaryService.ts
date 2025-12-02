import cloudinary from "../config/cloudinary";
import fs from "fs";

interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * آپلود تصویر یا ویدیو به کلاودینری
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string,
  resourceType: "image" | "video" = "image"
): Promise<UploadResult> => {
  try {
    // اصلاح: حذف .v2
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: resourceType,
    });

    // پاک کردن فایل موقت از سرور لوکال
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // حتی اگر ارور داد، فایل موقت را پاک کن تا سرور پر نشود
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * حذف یک فایل تکی از کلاودینری
 */
export const deleteFromCloudinary = async (
  publicId: string | null | undefined,
  resourceType: "image" | "video" = "image"
) => {
  if (!publicId) return;
  try {
    // اصلاح: حذف .v2
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete ${publicId} from Cloudinary:`, error);
  }
};

/**
 * حذف گروهی فایل‌ها (مثلاً وقتی یک محصول با چند عکس حذف می‌شود)
 */
export const deleteManyFromCloudinary = async (publicIds: string[]) => {
  if (!publicIds || publicIds.length === 0) return;
  try {
    // اصلاح: حذف .v2
    await cloudinary.api.delete_resources(publicIds);
    console.log(`Deleted ${publicIds.length} images from Cloudinary`);
  } catch (error) {
    console.error("Failed to delete multiple images:", error);
  }
};
