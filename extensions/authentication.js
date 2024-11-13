// AuthenticationMiddleware.js (ahora en ES Modules)
export default function AuthenticationMiddleware(req, res, next) {
    if (req.isAuthenticated()) { // returns true if the session was started
        return next(); // calls the next middleware in the stack
    } else {
        // user not authenticated
        res.redirect("/login");
    }
}
