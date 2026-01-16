// Sectors/Categories for food companies
export const sectors = [
  { id: 1, name: 'Rice & Grains' },
  { id: 2, name: 'Spices & Seasonings' },
  { id: 3, name: 'Fruits & Vegetables' },
  { id: 4, name: 'Dairy Products' },
  { id: 5, name: 'Meat & Poultry' },
  { id: 6, name: 'Seafood' },
  { id: 7, name: 'Bakery & Confectionery' },
  { id: 8, name: 'Beverages' },
  { id: 9, name: 'Processed Foods' },
  { id: 10, name: 'Organic Products' },
  { id: 52, name: 'Export Trading' }
];

export function getSectorById(id) {
  return sectors.find(s => s.id === id);
}

export function getSectorName(id) {
  const sector = getSectorById(id);
  return sector ? sector.name : 'Unknown Sector';
}