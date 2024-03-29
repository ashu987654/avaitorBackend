// generateRoutes.js
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const { generateAndBroadcastNumber, sendMoney ,receiveMoney,getTransactions} = require('../controllers/generateController');

module.exports = (io) => {
  // Route to trigger number generation and broadcast
  router.get('/currentData', (req, res) => {
    generateAndBroadcastNumber(io);
    res.send('Generate route');
  });
  router.get('/getTrans',getTransactions)
  // Route to handle sending money
  router.post('/sendMoney', async (req, res) => {
    const { phone, time, amount,avatar } = req.body;

    try {
      await sendMoney(io, phone,time, amount);
      res.status(200).json({ message: 'Money sent successfully' });
    } catch (error) {
      console.error('Error sending money:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  router.post('/receiveMoney', async (req, res) => {
    const { phone, time, amount } = req.body;

    try {
      await receiveMoney(io, phone,time, amount);
      res.status(200).json({ message: 'Money sent successfully' });
    } catch (error) {
      console.error('Error sending money:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  return router;
};
