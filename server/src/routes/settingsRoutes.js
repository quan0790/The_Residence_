import express from "express";
const router = express.Router();

// Example in-memory store (replace with MongoDB model)
let settings = {
  fullName: "",
  email: "",
  businessName: "",
  address: "",
  phone: "",
  currency: "USD",
  defaultLateFee: 0,
  paymentGracePeriod: 0,
  timezone: "UTC",
  systemMode: "A",
  emailReminders: true,
  smsReminders: false,
};

router.get("/", (req, res) => {
  res.json(settings);
});

router.put("/", (req, res) => {
  settings = { ...settings, ...req.body };
  res.json({ success: true, settings });
});

export default router;
