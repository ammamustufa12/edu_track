const express = require('express');
const router = express.Router();

const ALLOWED_LEVELS = ['cp', 'cei'];
const ALLOWED_STATUS = ['Active', 'Inactive', 'Pending', 'Completed'];

module.exports = (supabase) => {
  // CREATE formation
  router.post('/', async (req, res) => {
    const { formation_name, from_date, end_date, level, status } = req.body;

    if (!formation_name || !from_date || !end_date || !level || !status) {
      return res.status(400).json({ success: false, error: 'All fields including status are required' });
    }

    if (!ALLOWED_LEVELS.includes(level)) {
      return res.status(400).json({ success: false, error: 'Invalid level value' });
    }

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const { data, error } = await supabase
      .from('formations')
      .insert({ formation_name, from_date, end_date, level, status })
      .select();

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, formation: data[0] });
  });

  // READ ALL formations, with optional status filter
  router.get('/', async (req, res) => {
    const { status } = req.query;

    let query = supabase
      .from('formations')
      .select('*')
      .order('id', { ascending: false });

    if (status && status !== 'All') {
      if (!ALLOWED_STATUS.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status filter value' });
      }
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, formations: data });
  });

  // READ ONE formation by id
  router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ success: false, error: error.message });

    res.json({ success: true, formation: data });
  });

  // UPDATE formation by id
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { formation_name, from_date, end_date, level, status } = req.body;

    if (!formation_name || !from_date || !end_date || !level || !status) {
      return res.status(400).json({ success: false, error: 'All fields including status are required for update' });
    }

    if (!ALLOWED_LEVELS.includes(level)) {
      return res.status(400).json({ success: false, error: 'Invalid level value' });
    }

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const { data, error } = await supabase
      .from('formations')
      .update({ formation_name, from_date, end_date, level, status })
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, formation: data[0] });
  });

  // DELETE formation by id
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
      .from('formations')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, message: 'Formation deleted successfully' });
  });

  return router;
};
