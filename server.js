const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configure your MySQL connection here
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // Replace with your MySQL username
  password: 'Piyush@2811', // Replace with your MySQL password
  database: 'food_order_db',     // Ensure this DB exists with tables created
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// API to save orders
app.post('/api/orders', async (req, res) => {
  const { customerName, phone, email, address, notes, cartItems } = req.body;

  if (
    !customerName ||
    !phone ||
    !email ||
    !address ||
    !Array.isArray(cartItems) ||
    cartItems.length === 0
  ) {
    return res.status(400).json({ error: 'Missing required fields or empty cart' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert order
    const [orderResult] = await conn.query(
      `INSERT INTO Orders (CustomerName, Phone, Email, Address, Notes) VALUES (?, ?, ?, ?, ?)`,
      [customerName, phone, email, address, notes || null]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cartItems) {
      await conn.query(
        `INSERT INTO OrderItems (OrderId, FoodId, Quantity, Price) VALUES (?, ?, ?, ?)`,
        [orderId, item.foodId, item.quantity, item.price]
      );
    }

    await conn.commit();
    res.json({ message: 'Order saved successfully', orderId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    conn.release();
  }
});

// API to get pending orders with items (for admin)
app.get('/api/admin/orders', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        o.OrderId, o.CustomerName, o.Phone, o.Email, o.Address, o.Notes, o.OrderDate,
        oi.Quantity, oi.Price, f.FoodName
      FROM Orders o
      JOIN OrderItems oi ON o.OrderId = oi.OrderId
      JOIN Food f ON oi.FoodId = f.FoodId
      WHERE o.Status = 'Pending'
      ORDER BY o.OrderDate DESC
    `);

    // Group by orderId
    const ordersMap = new Map();
    rows.forEach((row) => {
      if (!ordersMap.has(row.OrderId)) {
        ordersMap.set(row.OrderId, {
          orderId: row.OrderId,
          customerName: row.CustomerName,
          phone: row.Phone,
          email: row.Email,
          address: row.Address,
          notes: row.Notes,
          orderDate: row.OrderDate,
          items: [],
        });
      }
      ordersMap.get(row.OrderId).items.push({
        foodName: row.FoodName,
        quantity: row.Quantity,
        price: row.Price,
      });
    });

    res.json(Array.from(ordersMap.values()));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
