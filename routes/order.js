const router = require("express").Router();
const orderCtrl = require("../controllers/orderCtrl");
const authUser = require("../middleware/authUser");

router.get("/", authUser, orderCtrl.getAllOrders);
router.get("/:order_id", authUser, orderCtrl.getOrder);
router.post("/", authUser, orderCtrl.createOrder);

module.exports = router;
