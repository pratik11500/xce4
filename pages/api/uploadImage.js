import multiparty from 'multiparty';
import cloudinary from 'cloudinary';
import { mongooseConnect } from '@/lib/mongoose';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handle(req, res) {
  await mongooseConnect();
  const form = new multiparty.Form();
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const uploadPromises = files['file-upload'].map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file.path, (result) => {
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result.secure_url);
        }
      });
    });
  });

  try {
    const links = await Promise.all(uploadPromises);
    return res.json({ links });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export const config = {
  api: { bodyParser: false },
};

