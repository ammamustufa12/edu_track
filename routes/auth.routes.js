const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (supabase) => {
  const router = express.Router();

  // POST /api/v1/auth/register
  router.post('/register', async (req, res) => {
    try {
      let { name, email, password, role } = req.body;

      email = String(email).trim().replace(/^"|"$/g, '');
      role = role || 'user';

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password_hash: hashedPassword,
          role,
          is_active: true,
        })
        .select('id, name, email, role, is_active');

      if (error) throw error;

      res.status(201).json({
        success: true,
        user: data[0],
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message,
        details: error,
      });
    }
  });

  // POST /api/v1/auth/login
  router.post('/login', async (req, res) => {
    try {
      let { email, password } = req.body;

      email = String(email).trim().replace(/^"|"$/g, '');

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
        });
      }

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (error) throw error;

      const user = users && users[0];

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const { password_hash, ...safeUser } = user;

      res.status(200).json({
        success: true,
        user: safeUser,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message,
      });
    }
  });

  // GET /api/v1/auth/me?id=123
  router.get('/me', async (req, res) => {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ success: false, error: 'User ID is required' });

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_active')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, user: data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch user', message: error.message });
    }
  });

  // PUT /api/v1/auth/:id (update user)
  router.put('/:id', async (req, res) => {
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
      res.status(500).json({ success: false, error: 'Update failed', message: error.message });
    }
  });

  // DELETE /api/v1/auth/:id
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Delete failed', message: error.message });
    }
  });

  // POST /api/v1/auth/reset-password/:id
  router.post('/reset-password/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { data, error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('id', id)
        .select('id, name, email, role, is_active');

      if (error) throw error;

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        user: data[0],
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Password reset failed',
        message: error.message,
      });
    }
  });

  // PATCH /api/v1/auth/toggle-status/:id
  router.patch('/toggle-status/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Get current is_active status
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });

      const newStatus = !user.is_active;

      // Update the status
      const { data, error: updateError } = await supabase
        .from('users')
        .update({ is_active: newStatus })
        .eq('id', id)
        .select('id, name, email, role, is_active');

      if (updateError) throw updateError;

      res.status(200).json({
        success: true,
        message: `User has been ${newStatus ? 'activated' : 'deactivated'}`,
        user: data[0],
      });
    } catch (error) {
      console.error('Toggle status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle status',
        message: error.message,
      });
    }
  });

  // GET /api/v1/auth/all
  router.get('/all', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, is_active');

      if (error) throw error;

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users', message: error.message });
    }
  });

  return router;
};
