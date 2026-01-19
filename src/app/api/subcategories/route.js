import { NextResponse } from 'next/server';
import { subCategories, getSubCategoryById, getSubCategoriesByCategory, getAllSubCategoryNames } from '@/data/subcategories';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get single sub-category by ID
  const id = searchParams.get('id');
  if (id) {
    const subCategory = getSubCategoryById(parseInt(id));
    if (!subCategory) {
      return NextResponse.json(
        { error: 'Sub-category not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(subCategory);
  }
  
  // Get sub-categories by category
  const categoryId = searchParams.get('category_id');
  if (categoryId) {
    const categorySubCategories = getSubCategoriesByCategory(categoryId);
    return NextResponse.json({
      subCategories: categorySubCategories,
      total: categorySubCategories.length
    });
  }
  
  // Get all unique sub-category names (for filter dropdown)
  if (searchParams.get('action') === 'names') {
    return NextResponse.json({
      names: getAllSubCategoryNames()
    });
  }
  
  // Get all sub-categories
  return NextResponse.json({
    subCategories,
    total: subCategories.length
  });
}
