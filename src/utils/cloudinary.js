import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const uploader = (async function (localFilePath) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  // Upload an image
  console.log("Uploading...");
  
  try {
    const uploadResult = await cloudinary.uploader.upload
      (localFilePath, {
        resource_type: "auto",
      });
    console.log("File is uploaded successfully:", uploadResult.url);
    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Cloudinary uploading error:", error);
    return null;
  }
});

export default uploader;