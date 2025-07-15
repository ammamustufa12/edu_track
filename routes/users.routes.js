const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (supabase) => {
  const router = express.Router();

  // GET all users
  router.get('/users', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_active')
        .order('id', { ascending: true });

      if (error) throw error;

      res.status(200).json({ success: true, users: data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET user by ID
  router.get('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_active')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, user: data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // CREATE new user
  router.post('/users', async (req, res) => {
    try {
      const { name, email, password, role, is_active = true } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data, error } = await supabase
        .from('users')
        .insert({ name, email, role, is_active, password_hash: hashedPassword })
        .select('id, name, email, role, is_active');

      if (error) throw error;

      res.status(201).json({ success: true, user: data[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // UPDATE user
  router.put('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, is_active } = req.body;

      const { data, error } = await supabase
        .from('users')
        .update({ name, email, role, is_active })
        .eq('id', id)
        .select('id, name, email, role, is_active');

      if (error) throw error;

      res.status(200).json({ success: true, user: data[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE user
  router.delete('/users/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
