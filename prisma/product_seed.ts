import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient, Prisma } from '../src/app/generated/prisma/client'

// Get database credentials from environment variables
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = parseInt(process.env.DB_PORT || '3306', 10)
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD || ''
const dbName = process.env.DB_NAME || 'food-directory'
const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10)

// if (!dbPassword) {
//     console.error('Error: DB_PASSWORD environment variable is required')
//     process.exit(1)
// }

const adapter = new PrismaMariaDb({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    connectionLimit: connectionLimit,
})

const prisma = new PrismaClient({ adapter })

const productData: Prisma.ProductCreateInput[] = [
    // ROW 1
    { name: 'Chicken Meat (Fresh/Chilled)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Frozen Chicken Meat', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Whole Chicken', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chicken Cuts', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Frozen Chicken Nuggets', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chicken Sausages', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chicken Patties', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Zinger Fillet', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Desi Ghee', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Butter', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cheese', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Milk Powder', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Liquid Milk', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Yogurt', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cream', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Whey Powder', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Casein', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 2
    { name: 'Frozen Fish Fillets', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Whole Frozen Fish', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Shrimp', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Prawns', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Lobster', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Crab', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Squid', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cuttlefish', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Octopus', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Breaded Fish Products', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Canned Fish', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fish Oil', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fish Meal', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 3
    { name: 'Fresh Cut Flowers (Rose, Gladiolus, Tuberose)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Flower Buds', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Ornamental Plants', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Nursery Plants', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Indoor Plants', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Outdoor Plants', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Decorative Foliage', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Flower Seedlings', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 4
    { name: 'Mango (Fresh)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Dry Mango', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Mango Slices (Frozen)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Kinnow / Mandarin', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Oranges', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Dates (Fresh)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Aseel Dates', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Pitted Dates', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Raisins', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fresh Fruits & Vegetables', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cut Fruits / Fresh Fruit Salad', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Frozen Fruits', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Dehydrated Fruits & Vegetables', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Red Onion', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'White Onion', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Potato', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Sweet Potato', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Garlic (Fresh)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Garlic (Dry)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Ginger (Fresh)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Green Chilies', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Jalapeno', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Okra', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Tomato', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Mushrooms (Fresh/Chilled)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Nuts (General)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fresh Peas', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 5
    { name: 'Spices (General)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Black Pepper', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'White Pepper', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Red Chilli (Whole & Powder)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Turmeric (Whole & Powder)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Coriander Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cumin Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fennel Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fenugreek Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cloves', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cardamom', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cinnamon', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Tea', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Green Tea', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 6
    { name: 'Rice (Basmati & Non-Basmati)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Parboiled Rice', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Broken Rice', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Wheat', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Durum Wheat', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Maize', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Wheat Flour', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Whole Wheat Flour', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Maize Flour', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Rice Flour', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Corn Starch', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Potato Starch', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 7
    { name: 'Sesame Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Basil Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Guar (Seeds/Beans)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Soybean Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Sunflower Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Canola Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cotton Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Linseed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Groundnut Seed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Crude Vegetable Oils', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Refined Vegetable Oils', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Olive Oil', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Animal Fats', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Moringa (Leaves/Powder)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Ispaghol (Psyllium Husk)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Consumer Herbal Products', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 8
    { name: 'Sugar (Cane/Beet, Refined)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Brown Sugar', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Sugar Syrups', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Glucose Syrup', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Molasses', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Confectionery / Sweets', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Toffees', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Candies', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Bubble Gum / Chewing Gum', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chocolate', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chocolate Bars', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cocoa Powder', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 9
    { name: 'Pulses', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Lentils', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Beans', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Herbal Medicines', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Nutraceuticals', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Oregano Leaves', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Rosemary Leaves', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Mixed Herbs', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chaat Masala', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Spice Mixes', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Condiments', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Pickles / Achar', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Sauces / Ketchup', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chili Sauce', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Soy Sauce', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Flavouring Syrups', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Pulp / Puree / Paste', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Tomato Paste', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Nectars', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fresh Juices', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fruit Juices', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Sharbats', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Carbonated Drinks', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Beverages (Non-Alcoholic)', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Energy Drinks', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Non-Alcoholic Malt Drinks', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Ready-to-Eat Meals', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Soup', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Instant Noodles', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Bread / Naan / Cakes', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Pasta', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cookies / Biscuits / Rusks / Wafers', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chips / Nimco', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Snack Pellets', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cake Mixes', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Gluten-Free Products', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Porridge / Breakfast Cereals', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Frozen Paratha', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Frozen Samosas / Rolls / Veg Rolls', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Frozen Snacks', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Frozen Dessert / Ice Cream', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Peanut Butter', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Almond Butter', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cashew Butter', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Granola Bars', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Energy Bars', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Garlic Paste / Ginger Paste', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Canned Mushroom', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Glass Jar Mushroom', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 10
    // Poultry Feed, Cattle Feed, Fish Feed, Pet Feed, Oil Cake, Soybean Meal, Sunflower Meal, Feed Premixes, Feed Concentrates, Mineral & Vitamin Feed Supplements
    { name: 'Poultry Feed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cattle Feed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fish Feed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Pet Feed', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Oil Cake', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Soybean Meal', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Sunflower Meal', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Feed Premixes', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Feed Concentrates', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Mineral & Vitamin Feed Supplements', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 11
    { name: 'Raw Tobacco Leaves', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Tobacco Stems', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Tobacco Waste', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cigarettes', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cigars', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cigarillos', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Chewing Tobacco', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Snuff', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 12
    // Table Salt, Iodized Salt, Industrial Salt, Rock Salt, Pink Himalayan Salt, Crushed Salt, Refined Salt
    { name: 'Table Salt', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Iodized Salt', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Industrial Salt', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Rock Salt', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Pink Himalayan Salt', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Crushed Salt', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Refined Salt', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 13
    { name: 'Packaging Machines', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Food Processing Systems / Machinery', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Grain Milling Machines', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Rice Husking Machines', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Oil Expellers', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Fruit & Vegetable Processing Lines', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cold Storage Equipment', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Refrigeration Units', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Dairy Processing Equipment', hsCode: '100630', subSector: { connect: { id: 1 } } },

    // ROW 13
    { name: 'Halal Certification Services', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Quality & Phytosanitary Certification', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Organic Certification', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Laboratory Testing Services', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Cold Chain Logistics', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Shipping & Freight Forwarding', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Warehousing Services', hsCode: '100630', subSector: { connect: { id: 1 } } },
    { name: 'Customs Clearance', hsCode: '100630', subSector: { connect: { id: 1 } } },
    // Add more products here with their hsCode and subSector connections
    // Example:
    // { name: 'Super Kernel Basmati', hsCode: '100630', subSector: { connect: { id: 1 } } },
]

export async function main() {
    try {
        console.log('Starting product seed...')
        for (const s of productData) {
            await prisma.product.create({ data: s })
            console.log(`Created product: ${s.name}`)
        }
        console.log('Product seed completed successfully!')
    } catch (error) {
        console.error('Error during seed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
})