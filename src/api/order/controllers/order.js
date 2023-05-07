const LiqPay = require("liqpay");
const liqpay = new LiqPay(
  process.env.LIQPAY_PUBLIC_KEY,
  process.env.LIQPAY_PRIVAT_KEY
);

("use strict");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", {
  async createPayment(ctx) {
    const { amount, description, products } = ctx.request.body;
    const payment = await liqpay.api("request", {
      action: "pay",
      version: "3",
      amount: amount,
      currency: "UAH",
      description: description,
      rro_info: products,
      order_id: "order_id_" + Math.random(),
      sandbox: 1,
      result_url: `https://${process.env.CLIENT_URL}/success`,
      server_url: `https://${process.env.CLIENT_URL}/liqpay_callback`,
    });

    // Save the payment information to your database
    const { order_id, payment_id, signature } = payment;
    // Save the payment information to your database

    // Send the payment form to the client
    ctx.body = payment.form;
  },
  async paymentCallback(ctx) {
    const { data, signature } = ctx.request.body;
    const isValid =
      liqpay.str_to_sign(liqpay.private_key + data + liqpay.private_key) ===
      signature;
    if (isValid) {
      // Update the order status in your database
      const orderId = data.order_id;
      // Update the order status in your database
      ctx.body = { status: "success" };
    } else {
      ctx.body = { status: "error" };
    }
  },
});
