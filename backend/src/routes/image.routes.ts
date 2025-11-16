import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import SupabaseService from '../service/supabase.service';
import { authHandler } from '../middleware/auth.middleware';

const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();

/**
 * @openapi
 * /images/upload:
 *   post:
 *     summary: Upload image to Supabase storage
 *     tags:
 *       - Image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - file
 *             properties:
 *               id:
 *                 type: string
 *                 description: General ID for the image (e.g., review ID, user ID)
 *                 example: '123'
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               bucketName:
 *                 type: string
 *                 description: Supabase bucket name (defaults to 'review-images')
 *                 example: 'review-images'
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadImageResponse'
 *       400:
 *         description: No file uploaded or id not provided
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/upload',
  upload.single('file'), // Handle single file upload
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.body.id; // General ID passed in the request body
      const file = req.file; // The uploaded file
      const bucketName = req.body.bucketName || 'review-images'; // Default to 'review-images'

      // Ensure id and file are provided
      if (!id || !file) {
        return res
          .status(400)
          .json({ message: 'No file uploaded or id not provided' });
      }

      // Use SupabaseService to upload the image
      const imageUrl = await SupabaseService.uploadImage(id, file, bucketName);

      // Return the uploaded image URL
      res.status(200).json({ imageUrl });
    } catch (err) {
      next(err); // Pass the error to the error handler
    }
  },
);

/**
 * @openapi
 * /images/delete:
 *   post:
 *     summary: Delete image from Supabase storage
 *     tags:
 *       - Image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImageDeleteRequest'
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageDeleteResponse'
 *       400:
 *         description: Missing image URL
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       5XX:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/delete',
  authHandler, // Ensure user is authenticated
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: 'Missing image URL' });
      }

      // Remove the image using the Supabase service
      const response = await SupabaseService.deleteImage(imageUrl);

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
