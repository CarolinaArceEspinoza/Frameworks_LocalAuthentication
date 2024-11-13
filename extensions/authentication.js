
export default function AuthenticationMiddleware(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // user not authenticated
        res.redirect("/login");
    }
}
