import "dotenv/config";
import { createApp } from "../server/_core/createApp";

// Vercel serverless function — exports the Express app as the handler.
// Static files are served by Vercel CDN from dist/public/ (see vercel.json).
export default createApp();
