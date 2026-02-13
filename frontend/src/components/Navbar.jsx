const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary position-sticky">
      <div>LetsMeet</div>

      <div className="d-flex">
        <div>Browse Events</div>
        <div>Browse Sponsor</div>
      </div>

      <div className="d-flex">
        <div>Login</div>
        <div>Register</div>
      </div>
    </nav>
  );
};

export default Navbar;
