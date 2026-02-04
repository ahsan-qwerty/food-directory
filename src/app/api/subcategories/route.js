import { NextResponse } from 'next/server';
import { products, getProductById, getProductsBySubSector, getAllProductNames } from '../../../data/products';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Get single product by ID
  const id = searchParams.get('id');
  if (id) {
    const product = getProductById(parseInt(id));
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  }

  // Get products by sub-sector (currently returns all)
  const subSectorId = searchParams.get('sub_sector_id');
  if (subSectorId) {
    const subSectorProducts = getProductsBySubSector(subSectorId);
    return NextResponse.json({
      products: subSectorProducts,
      total: subSectorProducts.length
    });
  }

  // Get all unique product names (for filter dropdown)
  if (searchParams.get('action') === 'names') {
    return NextResponse.json({
      names: getAllProductNames()
    });
  }

  // Get all products
  return NextResponse.json({
    products,
    total: products.length
  });
}
