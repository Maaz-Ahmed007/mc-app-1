import { NextResponse } from "next/server";
import { prismadb } from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    if (!params.sectionId) {
      return new NextResponse("Section ID is required", { status: 400 });
    }

    const section = await prismadb.section.findUnique({
      where: {
        id: params.sectionId,
      },
      select: {
        sectionName: true,
        telephone: true,
        mobileWazir: true,
        mobileDin: true,
        email: true,
      },
    });

    if (!section) {
      return new NextResponse("Section not found", { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.log('[SECTION_INFO_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}