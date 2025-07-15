const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
  // CREATE
  router.post('/', async (req, res) => {
    const { formation_name, from_date, end_date, level } = req.body;
    if (!formation_name || !from_date || !end_date || !level) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    if (!['cp', 'cei'].includes(level)) {
      return res.status(400).json({ success: false, error: 'Invalid level value' });
    }

    const { data, error } = await supabase
      .from('formations')
      .insert({ formation_name, from_date, end_date, level })
      .select();

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, formation: data[0] });
  });

  // READ ALL
  router.get('/', async (req, res) => {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .order('id', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, formations: data });
  });

  // READ ONE
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

  // UPDATE
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { formation_name, from_date, end_date, level } = req.body;

    if (!['cp', 'cei'].includes(level)) {
      return res.status(400).json({ success: false, error: 'Invalid level' });
    }

    const { data, error } = await supabase
      .from('formations')
      .update({ formation_name, from_date, end_date, level })
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ success: false, error: error.message });

    res.json({ success: true, formation: data[0] });
  });

  // DELETE
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
