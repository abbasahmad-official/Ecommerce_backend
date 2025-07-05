const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");
const { userById } = require("../controllers/user");
const { generateToken, create_checkout_session } = require("../controllers/braintree");
const {createOrderPaypal, capturePaypalOrder} = require("../controllers/paypal")
require('dotenv').config()
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);

router.get("/braintree/getToken/:userId", requireSignin, isAuth, generateToken );
router.post("/stripe/checkout/:userId", requireSignin, isAuth, create_checkout_session );
// router.post("/paypal/create-order/",  createOrderPaypal );
// router.post("/paypal/capture-order/",  capturePaypalOrder );

router.get("/stripe/transaction/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Retrieve the session details from Stripe using sessionId
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // console.log(session);

    // Check the payment status
    if (session.payment_status === "paid") {
      // If payment is successful, send the transaction details
      return res.json({
        status: "succeeded",
        transactionId: session.payment_intent, // Stripe's payment intent ID
      });
    } else {
      return res.json({ status: "failed" });
    }
  } catch (error) {
    console.error("Stripe transaction fetch error:", error);
    return res.status(500).json({ error: "Failed to retrieve transaction details" });
  }
});





router.param("userId", userById);

module.exports = router;