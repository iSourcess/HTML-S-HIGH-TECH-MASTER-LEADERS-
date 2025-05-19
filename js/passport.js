const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: 'TU_CLIENT_ID',
    clientSecret: 'TU_CLIENT_SECRET',
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // Aquí puedes guardar info del usuario o crear sesión
    return done(null, profile);
  }
));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Autenticación correcta, redireccionar donde quieras
    res.redirect('/dashboard');
  });
