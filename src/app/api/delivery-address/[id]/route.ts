// app/api/delivery-address/[id]/route.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { addressService } from "@/lib/addressService";
// import { addressService } from '@/lib/addressService';

type Params = Promise<{ id: string }>;

export async function PUT(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedAddress = await addressService.updateAddress(id, body);

    return NextResponse.json({
      success: true,
      address: updatedAddress,
    });
  } catch (error: any) {
    console.error("Error updating address:", error);
    const status = error.message === "Address not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update address" },
      { status },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }, // ← Fixed here
) {
  try {
    const { id } = await params; // ← Now safe to await

    await addressService.deleteAddress(id);

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting address:", error);
    const status = error.message === "Address not found" ? 404 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete address" },
      { status },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id } = await params;
    const address = await addressService.getAddressById(id);

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch address" },
      { status: 500 },
    );
  }
}
