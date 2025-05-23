import multer from 'multer'
import { allowedExtensions } from '../utilities/allowedExtentions.js';

export const multerCloudFunction = (allowedExtensionsArr) => {
  if (!allowedExtensionsArr) {
    allowedExtensionsArr = allowedExtensions.Image
  }
  //================================== Storage =============================
  const storage = multer.memoryStorage();  // Use memory storage to handle file buffer directly

  //================================== File Filter =============================
  const fileFilter = function (req, file, cb) {
    if (allowedExtensionsArr.includes(file.mimetype)) {
      return cb(null, true)
    }
    cb(new Error('In-valid Image Extension', { cause: 400 }), false)
  }

  const fileUpload = multer({
    fileFilter,
    storage,
  })
  return fileUpload
}