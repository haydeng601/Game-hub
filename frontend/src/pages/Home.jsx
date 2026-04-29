import { Link } from "react-router-dom";
function Home() {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div>
      <header>
        <div className="logo" aria-label="GAME AHN">
          <span className="logo-top">AHN</span>
          <span className="logo-main" aria-hidden="true">
            <span className="logo-letter letter-g">G</span>
            <span className="logo-letter letter-a">A</span>
            <span className="logo-letter letter-m">M</span>
            <span className="logo-letter letter-e">E</span>
          </span>
        </div>

        <nav>
  {user ? (
    <>
      <span>Welcome, {user.username}</span>
      <Link to="/dashboard">Dashboard</Link>
      <button
        onClick={() => {
          localStorage.removeItem("user");
          window.location.reload();
        }}
      >
        Log Out
      </button>
    </>
  ) : (
    <>
      <Link to="/login">Log in</Link>
      <Link to="/signup">Sign Up</Link>
    </>
  )}
</nav>
      </header>

      <main id="games-menu">
        <div className="game-grid">
          <a href="/games/tictactoe/index.html" className="game-card">
            <img src="/games/tictactoe/imgs/robot.png" alt="TTTcover" />
            <div className="game-name">Tic-Tac-Toe</div>
          </a>

          <div className="game-card"></div>
          <div className="game-card"></div>
          <div className="game-card"></div>
          <div className="game-card"></div>
        </div>
      </main>
    </div>
  );
}

export default Home;