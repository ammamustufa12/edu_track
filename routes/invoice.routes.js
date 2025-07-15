const express = require('express');
const router = express.Router();

module.exports = (supabase) => {

  // ➕ Create a new invoice
  router.post('/invoices', async (req, res) => {
    try {
      const {
        user_id,
        invoice_number,
        amount,
        status,
        due_date,
        issue_date,
        notes,
      } = req.body;

      if (!user_id || !invoice_number || !amount) {
        return res.status(400).json({ success: false, error: 'user_id, invoice_number and amount are required' });
      }

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          user_id,
          invoice_number,
          amount,
          status,
          due_date,
          issue_date,
          notes,
        })
        .select('*');

      if (error) throw error;

      res.status(201).json({ success: true, invoice: data[0] });
    } catch (error) {
      console.error('Create Invoice Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 📥 Get all invoices
  router.get('/invoices', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({ success: true, invoices: data });
    } catch (error) {
      console.error('Fetch Invoices Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // 📥 Get one invoice by ID
  router.get('/invoices/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, invoice: data });
    } catch (error) {
      console.error('Get Invoice Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ✏️ Update an invoice
  router.put('/invoices/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        invoice_number,
        amount,
        status,
        due_date,
        issue_date,
        notes,
      } = req.body;

      const { data, error } = await supabase
        .from('invoices')
        .update({
          invoice_number,
          amount,
          status,
          due_date,
          issue_date,
          notes,
          updated_at: new Date(),
        })
        .eq('id', id)
        .select('*');

      if (error) throw error;

      res.status(200).json({ success: true, updated: data[0] });
    } catch (error) {
      console.error('Update Invoice Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // ❌ Delete an invoice
  router.delete('/invoices/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ success: true, message: 'Invoice deleted' });
    } catch (error) {
      console.error('Delete Invoice Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
