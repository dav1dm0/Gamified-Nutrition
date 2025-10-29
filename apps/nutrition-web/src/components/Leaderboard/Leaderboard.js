import React from 'react';
import './Leaderboard.css';

export default function Leaderboard({ users }) {
  if (!Array.isArray(users)) {
    return <div>No leaderboard data available.</div>;
  }
  return (
    <div className="leaderboard">
      <h3>Top Performers</h3>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Level</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.username} className={index < 3 ? `rank-${index + 1}` : ''}>
              <td>{user.rank ||index + 1}</td>
              <td>{user.username}</td>
              <td>{user.level}</td>
              <td>{user.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}