import React, { useState, useEffect } from 'react';
import * as api from '../../api';
import Leaderboard from '../../components/Leaderboard/Leaderboard';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getLeaderboard().then(response => setUsers(response.data));
  }, []);

  return <Leaderboard users={users} />;
}