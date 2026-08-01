import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { productCatalogService } from '@/modules/product-catalog';
import { success, error } from '@/modules/shared/utils/response-envelope';
import { ProductCatalogErrors } from '@/modules/shared/errors/product-catalog.errors';
import { createRequestId } from '@/modules/shared/utils/response-envelope';

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { imageId } = await params;
    await productCatalogService.deleteImage(imageId);
    return NextResponse.json(success({ deleted: true }, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.IMAGE_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.IMAGE_NOT_FOUND, 'Image not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error deleting image'), { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(error('CORE_USER_UNAUTHORIZED', 'Authentication required'), { status: 401 });
    }
    const { id, imageId } = await params;
    const image = await productCatalogService.setPrimaryImage(id, imageId);
    return NextResponse.json(success(image, createRequestId()));
  } catch (err: unknown) {
    if (err instanceof Error && err.message === ProductCatalogErrors.IMAGE_NOT_FOUND) {
      return NextResponse.json(error(ProductCatalogErrors.IMAGE_NOT_FOUND, 'Image not found'), { status: 404 });
    }
    return NextResponse.json(error('INTERNAL_ERROR', 'Error setting primary image'), { status: 500 });
  }
}
