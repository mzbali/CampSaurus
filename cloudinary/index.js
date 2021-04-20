const cloudinary = require('cloudinary').v2; //cloudinary official libarary
const { CloudinaryStorage } = require('multer-storage-cloudinary'); //configure multer to upload image to cloudinary nicely

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'CampSaurus',
        allowed_formats: ['jpg, png, jpeg']
    }

});

module.exports = {
    cloudinary,
    storage
}

