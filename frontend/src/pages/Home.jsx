import { Link } from "react-router-dom";
function Home() {
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
          <Link to="/login">Log in</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
      </header>

      <main id="games-menu">
        <div className="game-grid">
          <div className="game-card">
            <img src="/images/tictactoe.jpg" alt="TTTcover" />
            <div className="game-name">Tic-Tac-Toe</div>
          </div>

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