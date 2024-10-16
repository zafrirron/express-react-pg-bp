const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const requireRole = require('../middlewares/requireRole');
const routesConfig = require('/usr/src/common/routesConfig');  // Correct path to the shared config

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Retrieve all items from the database
 *     description: Query the PostgreSQL database to retrieve all items.
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Item 1"
 *                       description:
 *                         type: string
 *                         example: "This is an item description"
 */
router.get('/', requireRole('items'), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description FROM items');
    res.json({ message: 'Data fetched successfully', data: result.rows });
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
