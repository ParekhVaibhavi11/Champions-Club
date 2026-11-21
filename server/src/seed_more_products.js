import pool from './config/db.js';

async function seedProducts() {
  const products = [
    { name: 'Wilson Clash 100 V2 Tennis Racket', cat: 1, sku: 'RKT-TEN-CLS', ret: 15500, mem: 13200, stock: 9, desc: 'Supreme flexibility and stability for all-court performance.' },
    { name: 'MRF Grand Edition English Willow Cricket Bat', cat: 1, sku: 'BAT-CRI-MRF', ret: 18500, mem: 15700, stock: 6, desc: 'Premium grade 1 English willow profile designed for boundary hitting.' },
    { name: 'Yonex Astrox 88D Pro Badminton Racket', cat: 1, sku: 'RKT-BAD-AST', ret: 13800, mem: 11700, stock: 12, desc: 'Rotational generator system for devastating offensive smash power.' },
    { name: 'Adidas Adipower 3.2 Padel Racket', cat: 1, sku: 'RKT-PAD-ADI', ret: 17200, mem: 14600, stock: 7, desc: 'Dual Exoskeleton frame for elite power and precision control.' },
    { name: 'Slazenger Wimbledon Tennis Balls (Tin of 4)', cat: 2, sku: 'BAL-TEN-WIM', ret: 1200, mem: 1000, stock: 50, desc: 'Hydroguard water-resistant felt official championship match balls.' },
    { name: 'SG Club Red Leather Cricket Balls (Pack of 6)', cat: 2, sku: 'BAL-CRI-SG6', ret: 4200, mem: 3500, stock: 18, desc: 'High quality Portuguese cork center with alum tanned leather.' },
    { name: 'Babolat Court Padel Balls (Can of 3)', cat: 2, sku: 'BAL-PAD-CAN', ret: 850, mem: 700, stock: 40, desc: 'High pressure needle felt balls tuned for fast rebound and durability.' },
    { name: 'Yonex Mavis 350 Plastic Shuttles (Pack of 6)', cat: 2, sku: 'SHT-BAD-MAV', ret: 980, mem: 820, stock: 65, desc: 'Precision engineered nylon shuttlecocks with natural cork base.' },
    { name: 'Nike Court Air Zoom Vapor Pro 2 Shoes', cat: 3, sku: 'SHO-TEN-NK', ret: 11995, mem: 10200, stock: 10, desc: 'Lightweight court speed shoes with responsive Zoom Air cushioning.' },
    { name: 'Puma 19.1 Spike Cricket Shoes', cat: 3, sku: 'SHO-CRI-PUM', ret: 8499, mem: 7200, stock: 8, desc: 'Metal spikes for explosive traction and soft EVA midsole support.' },
    { name: 'Yonex Power Cushion 65 Z3 Badminton Shoes', cat: 3, sku: 'SHO-BAD-YNX', ret: 9990, mem: 8500, stock: 14, desc: 'Shock absorbing Power Cushion+ for seamless footwork and agility.' },
    { name: 'Wilson Super Tour 9-Pack Pro Tennis Bag', cat: 4, sku: 'BAG-TEN-PRO', ret: 7900, mem: 6700, stock: 8, desc: 'Dual racket compartments with Thermoguard lining to protect string tension.' },
    { name: 'Kookaburra Pro Players Cricket Kit Bag', cat: 4, sku: 'BAG-CRI-WHL', ret: 6800, mem: 5800, stock: 5, desc: 'Heavy duty wheelie gear bag with internal bat compartment and coolers.' },
    { name: 'Yonex Super Grap Overgrip (Pack of 12)', cat: 4, sku: 'ACC-GRP-12P', ret: 1400, mem: 1200, stock: 45, desc: 'Tacky non-slip absorbent overgrip for maximum sweat control.' },
    { name: 'Luxilon ALU Power 125 Tennis String Reel (220m)', cat: 4, sku: 'STR-TEN-ALU', ret: 18900, mem: 16000, stock: 4, desc: 'The #1 co-polyester string on the pro tour for maximum spin and control.' }
  ];

  for (const item of products) {
    const existing = await pool.query('SELECT id FROM products WHERE sku = $1', [item.sku]);
    let pId;
    if (existing.rows.length === 0) {
      const pRes = await pool.query(
        'INSERT INTO products (category_id, sku, name, description, retail_price, member_price, image_url, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id',
        [item.cat, item.sku, item.name, item.desc, item.ret, item.mem, '/images/products/sample.png']
      );
      pId = pRes.rows[0].id;
    } else {
      pId = existing.rows[0].id;
    }

    const inv = await pool.query('SELECT product_id FROM inventory WHERE product_id = $1', [pId]);
    if (inv.rows.length === 0) {
      await pool.query(
        'INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES ($1, $2, 5)',
        [pId, item.stock]
      );
    } else {
      await pool.query(
        'UPDATE inventory SET quantity = $1 WHERE product_id = $2',
        [item.stock, pId]
      );
    }
  }

  const countRes = await pool.query('SELECT count(*) FROM products');
  console.log('✅ Total catalog products in database:', countRes.rows[0].count);
  process.exit(0);
}

seedProducts().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
