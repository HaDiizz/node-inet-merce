const router = require("express").Router();
const productCtrl = require("../controllers/productCtrl");
const authAdmin = require("../middleware/authAdmin");

router.get("/", productCtrl.getAllProducts);
router.get("/:product_id", productCtrl.getProduct);
router.post("/", authAdmin, productCtrl.createProduct);
router.put("/:product_id", authAdmin, productCtrl.updateProduct);
router.delete("/:product_id", authAdmin, productCtrl.deleteProduct);

module.exports = router;
