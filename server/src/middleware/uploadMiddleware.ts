import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
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

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

export const uploadExcel = multer({
  storage: storage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
});
