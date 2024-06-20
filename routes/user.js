const router = require("express").Router();
const userCtrl = require("../controllers/userCtrl");
const authAdmin = require("../middleware/authAdmin");
const authUser = require("../middleware/authUser");

router.get("/", authAdmin, userCtrl.getAllUsers);
router.get("/:id", authUser, userCtrl.getUser);
router.put("/:id", authUser, userCtrl.updateUser);
router.delete("/:id", authAdmin, userCtrl.deleteUser);

module.exports = router;
