import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalNameWithoutExt = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    cb(null, originalNameWithoutExt + "-" + Date.now() + extension);
  },
});

const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."));
  }
};

const excelFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type! Please upload only Excel or CSV files."));
  }
};

const videoFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new Error("Not a video! Please upload only videos."));
  }
};

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

export const uploadExcel = multer({
  storage: storage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
});

// ** این بخش جدید را export کنید **
export const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB limit for videos
});
