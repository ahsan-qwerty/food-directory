import { NextResponse } from 'next/server';
import { categories, getCategoryById, getCategoriesBySector } from '@/data/categories';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get single category by ID
  const id = searchParams.get('id');
  if (id) {
    const category = getCategoryById(parseInt(id));
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(category);
  }
  
  // Get categories by sector
  const sectorId = searchParams.get('sector_id');
  if (sectorId) {
    const sectorCategories = getCategoriesBySector(sectorId);
    return NextResponse.json({
      categories: sectorCategories,
      total: sectorCategories.length
    });
  }
  
  // Get all categories
  return NextResponse.json({
    categories,
    total: categories.length
  });
}
