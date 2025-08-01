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
 // Update student
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

    // Validate required fields
    if (!firstname || !lastname || !birthdate || !level || !parent1_name || !parent1_phone) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Update student
    const { data, error } = await supabase
      .from('students')
      .update({
        firstname,
        lastname,
        birthdate,
        level,
        parent1_name,
        parent1_phone,
        parent2_name: parent2_name || null,
        parent2_phone: parent2_phone || null,
        status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

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

    // Check if student exists
    const { data: existingStudent, error: fetchError } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingStudent) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Delete student
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.json({
      success: true,
      message: 'Student deleted successfully',
      deletedStudent: existingStudent
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete student' });
  }
});


  return router;
};
