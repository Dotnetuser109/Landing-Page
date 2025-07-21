const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: 'rzp_test_knPmLCTXshYywt',
  key_secret: 'jW91e67IUGFaWaAjs5ONLeqU'
});

// 1. Create Razorpay Order
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // convert to paise
    currency: 'INR',
    receipt: 'rcpt_' + Date.now(),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Verify Payment Signature
app.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated_signature = crypto.createHmac('sha256', 'jW91e67IUGFaWaAjs5ONLeqU')
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    res.json({ status: 'success', verified: true });
  } else {
    res.status(400).json({ status: 'failure', verified: false });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
