import User from '../models/User.js';

// ─── Leaderboard ────────────────────────────────────────────────────────────
// gets the top players sorted by their best wpm
// only shows people who have actually played at least 1 game
// you can pass ?limit=10 to control how many results (max 100)

export const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const players1v1 = await User.find({ 'stats1v1.gamesPlayed': { $gt: 0 } })
      .select('username stats1v1')
      .sort({ 'stats1v1.avgWpm': -1 })
      .limit(limit);

    const playersMulti = await User.find({ 'statsMultiplayer.gamesPlayed': { $gt: 0 } })
      .select('username statsMultiplayer')
      .sort({ 'statsMultiplayer.avgWpm': -1 })
      .limit(limit);

    return res.status(200).json({ 
      leaderboard1v1: players1v1,
      leaderboardMulti: playersMulti 
    });
  } catch (error) {
    console.error('[getLeaderboard]', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard.' });
  }
};
