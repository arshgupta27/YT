import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploader = (async function (localFilePath) {
  // cloudinary.config({
  //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  //   api_key: process.env.CLOUDINARY_API_KEY,
  //   api_secret: process.env.CLOUDINARY_API_SECRET
  // });
  // Upload an image

  try {
    const uploadResult = await cloudinary.uploader.upload
      (localFilePath, {
        resource_type: "auto",
      });
    // console.log("File is uploaded successfully:", uploadResult.url);
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Cloudinary uploading error:", error);
    return null;
  }
});

const deleter = async function (publicId, type = 'image') {
  try {
    const deleteResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: type, 
    });

    if (deleteResult.result === 'ok') {
      console.log("File deleted successfully:", deleteResult);
    } else {
      console.log("File deletion failed or resource not found:", deleteResult);
    }

    return deleteResult;
  } catch (error) {
    console.log("Cloudinary deleting error:", error);
    return null;
  }
};

export { uploader, deleter };