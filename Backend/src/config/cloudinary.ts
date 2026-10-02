import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'lsydaklc',
  api_key: process.env.CLOUDINARY_API_KEY || '651996441653932',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'GO7GfkLdtR_BIA_o-nCgG4Ubih8',
  secure: true,
});

export default cloudinary;
