const express = require('express');

module.exports = (supabase) => {
  const router = express.Router();

  // @route GET /api/v1/users
  router.get('/users', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role');

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
