import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { response } from "express";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

// Upload an image
//     const uploadResult = await cloudinary.uploader
//         .upload(
//             "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//             {
//                 public_id: "shoes",
//             },
//         )
//         .catch((error) => {
//             console.log(error);
//         });

//     console.log(uploadResult);

//     // Optimize delivery by resizing and applying auto-format and auto-quality
//     const optimizeUrl = cloudinary.url("shoes", {
//         fetch_format: "auto",
//         quality: "auto",
//     });

//     console.log(optimizeUrl);

//     // Transform the image: auto-crop to square aspect_ratio
//     const autoCropUrl = cloudinary.url("shoes", {
//         crop: "auto",
//         gravity: "auto",
//         width: 500,
//         height: 500,
//     });

//     console.log(autoCropUrl);
// })();

const uploadOnCloud = async (filePath) => {
    try {
        if (!filePath) {
            return null;
        }
        cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });
        console.log("file uploaded successfully", response.url);
        fs.unlinkSync(filePath)
        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        console.log("file upload failed");
        return null;
    }
};
export { uploadOnCloud };
