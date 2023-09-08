import prisma from "@/service/db";
import { NextResponse } from "next/server";

export async function GET() {
  // get all user
  try {
    const users = await prisma.user.findMany({});
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error creating post:", error);
  }
}
