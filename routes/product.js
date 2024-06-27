const router = require("express").Router();
const productCtrl = require("../controllers/productCtrl");
const authAdmin = require("../middleware/authAdmin");
const upload = require("../helpers/upload");

router.get("/", productCtrl.getAllProducts);
router.get("/:product_id", productCtrl.getProduct);
router.post(
  "/",
  authAdmin,
  upload.single("product_image"),
  productCtrl.createProduct
);
router.put(
  "/:product_id",
  authAdmin,
  upload.single("product_image"),
  productCtrl.updateProduct
);
router.delete("/:product_id", authAdmin, productCtrl.deleteProduct);

module.exports = router;
