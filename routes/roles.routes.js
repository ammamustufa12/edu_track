const express = require('express');
module.exports = (supabase) => {
  const router = express.Router();

  // ✅ CREATE a Role - POST /api/v1/roles
  router.post('/', async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Role name is required' });
      }

      const { data, error } = await supabase
        .from('roles')
        .insert([{ name: name.trim() }])
        .select();

      if (error) throw error;

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        role: data[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create role',
        message: error.message,
      });
    }
  });

  // ✅ READ all Roles - GET /api/v1/roles
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      res.status(200).json({
        success: true,
        roles: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch roles',
        message: error.message,
      });
    }
  });

  // ✅ READ one Role by ID - GET /api/v1/roles/:id
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.status(200).json({
        success: true,
        role: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch role',
        message: error.message,
      });
    }
  });

  // ✅ UPDATE a Role - PUT /api/v1/roles/:id
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, error: 'Role name is required' });
      }

      const { data, error } = await supabase
        .from('roles')
        .update({ name: name.trim() })
        .eq('id', id)
        .select();

      if (error) throw error;

      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        role: data[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update role',
        message: error.message,
      });
    }
  });

  // ✅ DELETE a Role - DELETE /api/v1/roles/:id
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete role',
        message: error.message,
      });
    }
  });

  return router;
};
