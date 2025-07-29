const express = require('express');

module.exports = (supabase) => {
  const router = express.Router();

  // Get all students
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json({ success: true, students: data });
    } catch (error) {
      console.error('Fetch students error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch students' });
    }
  });

  // Get student by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, error: 'Student not found' });

      res.json({ success: true, student: data });
    } catch (error) {
      console.error('Fetch student error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch student' });
    }
  });

  // Create new student
// POST /api/v1/students
router.post('/', async (req, res) => {
  try {
    const {
      
      firstname,
      lastname,
      birthdate,
      level,
      parent1_name,
      parent1_phone,
      parent2_name,
      parent2_phone,
      status
    } = req.body;

    // Required fields validation
    if (
    
      !firstname ||
      !lastname ||
      !birthdate ||
      !level ||
      !parent1_name ||
      !parent1_phone
    ) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Insert student data into Supabase
    const { data, error } = await supabase
      .from('students')
      .insert({
      
        firstname,
        lastname,
        birthdate,
        level,
        parent1_name,
        parent1_phone,
        parent2_name: parent2_name || null,
        parent2_phone: parent2_phone || null,
        status,
        created_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, student: data });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, error: 'Failed to create student' });
  }
});



  // Update student
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        
        firstname,
        lastname,
        birthdate,
        level,
        parent1,
        parent2,
      
        status
      } = req.body;

      const { data, error } = await supabase
        .from('students')
        .update({
          emroll,
          firstname,
          lastname,
          birthdate,
          level,
          parent1_name: parent1?.name,
          parent1_phone: parent1?.phone,
          parent2_name: parent2?.name,
          parent2_phone: parent2?.phone,
          
          status,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, student: data });
    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({ success: false, error: 'Failed to update student' });
    }
  });

  // Delete student
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
      console.error('Delete student error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete student' });
    }
  });

  return router;
};
