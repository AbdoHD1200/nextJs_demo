import ImageKit, { type UploadResponse } from "imagekit";
// Strongly typed ImageKit configuration loaded from environment variables.
interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

function getImageKitConfig(): ImageKitConfig {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  // Fail fast on the server if configuration is missing to avoid silent upload failures.
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "Missing ImageKit configuration. Please set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT."
    );
  }

  return { publicKey, privateKey, urlEndpoint };
}

// Singleton ImageKit instance for server-side usage (API routes, server actions).
export const imagekit = new ImageKit(getImageKitConfig());

// ImageKit's upload has an overload that returns void when using a callback.
// Explicitly use the Promise-based UploadResponse type to avoid `void` inference.
export type ImageKitUploadResult = UploadResponse;
