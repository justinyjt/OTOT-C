// Initialize express router
let router = require('express').Router();
// Set default API response
router.get('/', function (req, res) {
    res.json({
        status: 'API Its Working',
        message: 'Welcome to OTOT_B1 crafted with love!',
    });
});
// Import contact controller
var contactController = require('./controller/contactController');
var UserController = require("./controller/userController");
var AuthController = require("./controller/authController");


const ROLES = UserController.ROLES;
// Contact routes


router.route('/contacts')
    .get(AuthController.AuthenticateRole([ROLES.User]), contactController.index)
    .post(AuthController.AuthenticateRole([ROLES.User]), contactController.new);
router.route('/contacts/:contact_id')
    .get(AuthController.AuthenticateRole([ROLES.User]), contactController.view)
    .patch(AuthController.AuthenticateRole([ROLES.User]), contactController.update)
    .put(AuthController.AuthenticateRole([ROLES.User]), contactController.update)
    .delete(AuthController.AuthenticateRole([ROLES.Admin]), contactController.delete);

router.route("/register/user").post(UserController.registerUser);
router.route("/register/admin").post(UserController.registerAdmin);
router.route("/signin").post(AuthController.signin);
router.route("/signout").post(AuthController.signout);

router
    .route("/admin-only")
    .get(
    AuthController.AuthenticateRole([ROLES.Admin]),
    AuthController.adminOnly
    );

router
    .route("/accesstoken")
    .post(
    AuthController.AuthenticateRole([ROLES.User]),
    AuthController.getAccessToken
    );
// Export API routes
module.exports = router;