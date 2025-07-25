const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // For sending email
const crypto = require('crypto'); // To generate random password

module.exports = (supabase) => {
  const router = express.Router();

  // POST /api/v1/auth/register
  // router.post('/register', async (req, res) => {
  //   try {
  //     let { name, email, password, role } = req.body;

  //     email = String(email).trim().replace(/^"|"$/g, '');
  //     role = role || 'user';

  //     if (!name || !email || !password) {
  //       return res.status(400).json({
  //         success: false,
  //         error: 'All fields are required',
  //       });
  //     }

  //     const salt = await bcrypt.genSalt(10);
  //     const hashedPassword = await bcrypt.hash(password, salt);

  //     const { data, error } = await supabase
  //       .from('users')
  //       .insert({
  //         name,
  //         email,
  //         password_hash: hashedPassword,
  //         role,
  //         is_active: true,
  //       })
  //       .select('id, name, email, role, is_active');

  //     if (error) throw error;

  //     res.status(201).json({
  //       success: true,
  //       user: data[0],
  //     });
  //   } catch (error) {
  //     console.error('Registration error:', error);
  //     res.status(500).json({
  //       success: false,
  //       error: 'Registration failed',
  //       message: error.message,
  //       details: error,
  //     });
  //   }
  // });
// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    let { name, email, phone, role } = req.body;

    email = String(email).trim().replace(/^"|"$/g, '');
    role = role || 'user';

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and phone are required',
      });
    }

    // Generate random password (8 characters)
    const password = crypto.randomBytes(4).toString('hex'); // e.g., "a3f9b2cd"

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        phone,
        password_hash: hashedPassword,
        role,
        is_active: true,
      })
      .select('id, name, email, phone, role, is_active');

    if (error) throw error;

    // Send email with login details
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Support Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Welcome to Our Platform - Your Account Details',
      html: `
        <h3>Hello ${name},</h3>
        <p>Your account has been created successfully. Below are your login details:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Role:</strong> ${role}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>You can login and change your password anytime.</p>
        <p>Thank you!</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      user: data[0],
      message: 'User registered and email sent successfully',
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
