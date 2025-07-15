const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

  // ➕ Create a new session
  router.post('/sessions', async (req, res) => {
    try {
      const { user_id, token, user_agent, ip_address } = req.body;

      if (!user_id || !token) {
        return res.status(400).json({ success: false, error: 'user_id and token are required' });
      }

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({ user_id, token, user_agent, ip_address })
        .select('*');

      if (error) throw error;

      res.status(201).json({ success: true, session: data[0] });
    } catch (error) {
      console.error('Create Session Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 📥 Get all sessions
  router.get('/sessions', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({ success: true, sessions: data });
    } catch (error) {
      console.error('Fetch Sessions Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 📥 Get a session by ID
  router.get('/sessions/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, session: data });
    } catch (error) {
      console.error('Get Session Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ✏️ Update a session
  router.put('/sessions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { token, user_agent, ip_address } = req.body;

      const { data, error } = await supabase
        .from('user_sessions')
        .update({ token, user_agent, ip_address })
        .eq('id', id)
        .select('*');

      if (error) throw error;

      res.status(200).json({ success: true, updated: data[0] });
    } catch (error) {
      console.error('Update Session Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ❌ Delete a session
  router.delete('/sessions/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true, message: 'Session deleted' });
    } catch (error) {
      console.error('Delete Session Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
