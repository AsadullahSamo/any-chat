import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
  cloud_name: 'dz16gppad', 
  api_key: '684966238534841', 
  api_secret: 'Z_pavV8vvU0oOcJjNPGFNufrLsU'
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) {
            return null
        }
        const result = await cloudinary.uploader.upload(localFilePath, 
            {resource_type: "auto"}
        );
        // console.log("File uploaded to Cloudinary: ", result.secure_url, result.url)
        return result.secure_url;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.error("Error uploading file to Cloudinary: ", error)
        return null
    }
} // end of uploadCloudinary


export {uploadCloudinary}