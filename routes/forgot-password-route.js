const express = require("express");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = (supabase) => {
  const router = express.Router();

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // POST /api/v1/auth/forgot-password
  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      console.log("Forgot Password Request:", email);

      if (!email) {
        return res.status(400).json({ success: false, error: "Email is required" });
      }

      // Find user by email
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      // Generate unique reset token
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      // Save token
      const { error: insertError } = await supabase
        .from("password_resets")
        .insert([{ email, token: resetToken, expires_at: expiresAt.toISOString() }]);

      if (insertError) {
        console.error("Token insert error:", insertError);
        return res.status(500).json({ success: false, error: "Failed to store reset token" });
      }

      // Reset link
      const baseUrl = process.env.CLIENT_BASE_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

      // Send the email
      await transporter.sendMail({
        from: `"Your App Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset Request",
        html: `
          <p>Hello ${user.name || "User"},</p>
          <p>You requested to reset your password.</p>
          <p>Click the link below to reset it:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link expires in 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });

      res.json({ success: true, message: "Password reset email sent." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ success: false, error: "Failed to send reset email" });
    }
  });

  // POST /api/v1/auth/reset-password
  router.post("/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      console.log("Reset Password Request:", { token, password });

      if (!token || !password) {
        return res.status(400).json({ success: false, error: "Token and password are required" });
      }

      // Find token
      const { data: resetRecord, error: tokenError } = await supabase
        .from("password_resets")
        .select("*")
        .eq("token", token)
        .single();

      if (tokenError || !resetRecord) {
        return res.status(400).json({ success: false, error: "Invalid or expired token" });
      }

      if (new Date(resetRecord.expires_at) < new Date()) {
        return res.status(400).json({ success: false, error: "Token has expired" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password (use password_hash column)
      const { error: updateError } = await supabase
        .from("users")
        .update({ password_hash: hashedPassword })
        .eq("email", resetRecord.email);

      if (updateError) {
        console.error("Password update error:", updateError);
        return res.status(500).json({ success: false, error: "Failed to update password" });
      }

      // Delete token
      await supabase.from("password_resets").delete().eq("token", token);

      res.json({ success: true, message: "Password has been reset successfully." });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ success: false, error: "Failed to reset password" });
    }
  });

  return router;
};
