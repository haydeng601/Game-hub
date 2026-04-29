import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({
    wins: 0,
    losses: 0,
    draws: 0,
    total: 0
  });

  const [message, setMessage] = useState("");

    useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    setMessage("Please log in to view your stats.");
    return;
  }

  const loadStats = () => {
    fetch(`http://localhost:5001/stats/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const formattedStats = {
          wins: 0,
          losses: 0,
          draws: 0,
          total: 0
        };

        data.forEach((stat) => {
          if (stat.result === "win") formattedStats.wins = stat.count;
          else if (stat.result === "loss") formattedStats.losses = stat.count;
          else if (stat.result === "draw") formattedStats.draws = stat.count;

          formattedStats.total += stat.count;
        });

        setStats(formattedStats);
      })
      .catch(() => setMessage("Could not load stats."));
  };

  loadStats();

  const interval = setInterval(loadStats, 2000);

  return () => clearInterval(interval);
}, []);

  return (
    <div>
      <h2>Dashboard</h2>

      {message && <p>{message}</p>}

      {!message && (
        <div>
          <h3>Tic-Tac-Toe Stats</h3>
          <p>Wins: {stats.wins}</p>
          <p>Losses: {stats.losses}</p>
          <p>Draws: {stats.draws}</p>
          <p>Total Plays: {stats.total}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;