const router = require("express").Router();
const userCtrl = require("../controllers/userCtrl");
const authAdmin = require("../middleware/authAdmin");
const authUser = require("../middleware/authUser");

router.get("/me", authUser, userCtrl.getMe);
router.put("/:id", authUser, userCtrl.updateUser);
router.get("/:id", authAdmin, userCtrl.getUser);
router.get("/", authAdmin, userCtrl.getAllUsers);
router.delete("/:id", authAdmin, userCtrl.deleteUser);

module.exports = router;
