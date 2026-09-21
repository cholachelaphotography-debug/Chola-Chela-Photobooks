import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const photos = await prisma.photo.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(photos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { dataUrl, originalName } = body;

    if (!dataUrl || typeof dataUrl !== "string") {
      return NextResponse.json(
        { error: "Missing image data" },
        { status: 400 }
      );
    }

    // If Cloudinary is configured, upload there
    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    let photoData;

    if (hasCloudinary) {
      const uploaded = await uploadImage(dataUrl);
      photoData = {
        userId: session.user.id,
        publicId: uploaded.public_id,
        url: uploaded.url,
        secureUrl: uploaded.secure_url,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
        originalName: originalName || null,
      };
    } else {
      // Fallback: store base64 reference (for local demo without Cloudinary)
      // In production you should always use Cloudinary or S3
      photoData = {
        userId: session.user.id,
        publicId: `local_${Date.now()}`,
        url: dataUrl,
        secureUrl: dataUrl,
        width: null,
        height: null,
        format: "unknown",
        bytes: Math.round((dataUrl.length * 3) / 4),
        originalName: originalName || null,
      };
    }

    const photo = await prisma.photo.create({
      data: photoData,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}
