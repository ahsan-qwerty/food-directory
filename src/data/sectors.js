// Main Sectors/Categories for food companies
export const sectors = [
  { id: 1, name: 'Cereals' },
  { id: 2, name: 'Fruits & Vegetables' },
  { id: 3, name: 'Beverages & Drinks' },
  { id: 4, name: 'Biscuits, Confectioneries, Bread, Pastries, Cakes & Chewing Gums' },
  { id: 5, name: 'Dry Fruits' },
  { id: 6, name: 'Processed Foods' },
  { id: 7, name: 'Oil & Ghee/Oil Seeds' },
  { id: 8, name: 'Salt' },
  { id: 9, name: 'Sea Food & Fisheries' },
  { id: 10, name: 'Spice & Spice Recipes' },
  { id: 11, name: 'Poultry, Meat, Dairy' },
  { id: 12, name: 'Honey' },
  { id: 13, name: 'Floriculture' },
  { id: 14, name: 'Agritech' },
  { id: 15, name: 'Tobacco' },
  { id: 16, name: 'Herbal & Wellness' }
];

export function getSectorById(id) {
  return sectors.find(s => s.id === id);
}

export function getSectorName(id) {
  const sector = getSectorById(id);
  return sector ? sector.name : 'Unknown Sector';
}
