import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer } from 'http';
import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; 

dotenv.config();
console.log("ENV CHECK:", {
  email: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD ? "✔️ Loaded" : "❌ Missing"
});


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(express.json());
app.use(cors({
origin: 'http://remrose-catering-rental-qada.vercel.app',
credentials: true
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db;
client.connect().then(() => {
  db = client.db('remrose');  
  console.log('Connected to MongoDB');
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD 
  }
});

// Helper Functions
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Remrose - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome to Remrose, ${name}!</h2>
        <p>Thank you for signing up. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #7c3aed; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">This is an automated message from Remrose. Please do not reply.</p>
      </div>
    `
  };


// Helper function to send payment rejection email
const sendPaymentRejectionEmail = async (userEmail, userName, bookingDetails, rejectionReason) => {
  const { bookingId, items, startDate, endDate, totalCost } = bookingDetails;
  
  const itemsList = items.map(item => {
    if (item.type === 'equipment') {
      return `<li>${item.equipmentName} - Qty: ${item.quantity}</li>`;
    } else {
      return `<li>${item.packageName} - Qty: ${item.quantity}</li>`;
    }
  }).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Remrose - Payment Verification Failed for Booking #${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ef4444;">
          <h1 style="color: #ef4444; margin: 0;">Remrose Rentals</h1>
          <p style="color: #6b7280; margin: 5px 0;">Payment Verification Failed</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h2 style="color: #1f2937;">Hello ${userName},</h2>
          <p style="color: #4b5563;">Unfortunately, we were unable to verify your GCash payment for the following booking:</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #ef4444; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Rental Period:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ₱${totalCost.toFixed(2)}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937;">Rented Items:</h3>
            <ul style="color: #4b5563;">
              ${itemsList}
            </ul>
          </div>

          <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-top: 0;">Reason for Rejection:</h3>
            <p style="color: #92400e; margin: 0;"><strong>${rejectionReason}</strong></p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="margin: 0; color: #1e40af;"><strong>Next Steps:</strong></p>
            <p style="margin: 5px 0; color: #1e40af;">Your booking has been cancelled and the items have been returned to inventory. If you would like to rebook, please:</p>
            <ol style="color: #1e40af; margin: 10px 0;">
              <li>Visit our website and create a new booking</li>
              <li>Ensure your payment screenshot is clear and shows the full transaction details</li>
              <li>Double-check that the payment amount matches your booking total</li>
            </ol>
          </div>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">For inquiries or assistance, contact us at:</p>
          <p style="color: #7c3aed; font-weight: bold; margin: 5px 0;">remrose.rentals@gmail.com</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">This is an automated message from Remrose. Please do not reply.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Rejection email sending error:', error);
    return { success: false, error };
  }
};

// REPLACE your existing /api/bookings/:id/verify-payment endpoint with this:

app.put('/api/bookings/:id/verify-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    const bookings = db.collection('bookings');
    const users = db.collection('users');
    const equipments = db.collection('equipments');
    const packages = db.collection('packages');

    const booking = await bookings.findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'pending_verification') {
      return res.status(400).json({ message: 'This booking is not pending payment verification' });
    }

    // Get user information
    const user = await users.findOne({ _id: new ObjectId(booking.userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (approved) {
      // ✅ Approve payment AND set status to confirmed
      await bookings.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            paymentStatus: 'paid',
            status: 'confirmed', // Auto-confirm when payment approved
            paymentVerifiedAt: new Date()
          } 
        }
      );
      
      console.log(`✅ Payment approved for booking ${id} - Status changed to CONFIRMED`);

      // Send approval receipt email
      if (user.email) {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

        const emailResult = await sendBookingReceiptEmail(user.email, user.name, {
          bookingId: id,
          items: booking.items,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalCost: booking.totalCost,
          paymentMethod: booking.paymentMethod,
          rentalDays: days
        });

        if (!emailResult.success) {
          console.error('Failed to send approval email:', emailResult.error);
        }
      }

      res.json({ message: 'Payment verified and booking confirmed. Receipt sent to customer.' });
    } else {
      // ❌ Reject payment - restore quantities for BOTH equipment AND packages
      if (booking.items && booking.items.length > 0) {
        for (const item of booking.items) {
          if (item.type === 'equipment') {
            await equipments.updateOne(
              { _id: new ObjectId(item.equipmentId) },
              { $inc: { available_quantity: item.quantity } }
            );
            console.log(`Restored ${item.quantity} units of equipment ${item.equipmentId}`);
          } else if (item.type === 'package') {
            await packages.updateOne(
              { _id: new ObjectId(item.packageId) },
              { $inc: { available_quantity: item.quantity } }
            );
            console.log(`Restored ${item.quantity} units of package ${item.packageId}`);
          }
        }
      }

      await bookings.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            paymentStatus: 'rejected',
            status: 'cancelled',
            rejectionReason: rejectionReason || 'Payment verification failed',
            rejectedAt: new Date()
          } 
        }
      );

      // Send rejection email
      if (user.email) {
        const emailResult = await sendPaymentRejectionEmail(user.email, user.name, {
          bookingId: id,
          items: booking.items,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalCost: booking.totalCost
        }, rejectionReason);

        if (!emailResult.success) {
          console.error('Failed to send rejection email:', emailResult.error);
        }
      }

      res.json({ message: 'Payment rejected and booking cancelled. Customer notified via email.' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// REPLACE your existing /api/bookings/:id/verify-payment endpoint with this:

app.put('/api/bookings/:id/verify-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    const bookings = db.collection('bookings');
    const users = db.collection('users');
    const equipments = db.collection('equipments');
    const packages = db.collection('packages');

    const booking = await bookings.findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'pending_verification') {
      return res.status(400).json({ message: 'This booking is not pending payment verification' });
    }

    // Get user information
    const user = await users.findOne({ _id: new ObjectId(booking.userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (approved) {
      // ✅ Approve payment
      await bookings.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            paymentStatus: 'paid',
            status: 'confirmed',
            paymentVerifiedAt: new Date()
          } 
        }
      );

      // Send approval receipt email
      if (user.email) {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

        const emailResult = await sendBookingReceiptEmail(user.email, user.name, {
          bookingId: id,
          items: booking.items,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalCost: booking.totalCost,
          paymentMethod: booking.paymentMethod,
          rentalDays: days
        });

        if (!emailResult.success) {
          console.error('Failed to send approval email:', emailResult.error);
        }
      }

      res.json({ message: 'Payment verified and booking confirmed. Receipt sent to customer.' });
    } else {
      // ❌ Reject payment - restore quantities for BOTH equipment AND packages
      if (booking.items && booking.items.length > 0) {
        for (const item of booking.items) {
          if (item.type === 'equipment') {
            await equipments.updateOne(
              { _id: new ObjectId(item.equipmentId) },
              { $inc: { available_quantity: item.quantity } }
            );
            console.log(`Restored ${item.quantity} units of equipment ${item.equipmentId}`);
          } else if (item.type === 'package') {
            await packages.updateOne(
              { _id: new ObjectId(item.packageId) },
              { $inc: { available_quantity: item.quantity } }
            );
            console.log(`Restored ${item.quantity} units of package ${item.packageId}`);
          }
        }
      }

      await bookings.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            paymentStatus: 'rejected',
            status: 'cancelled',
            rejectionReason: rejectionReason || 'Payment verification failed',
            rejectedAt: new Date()
          } 
        }
      );

      // Send rejection email
      if (user.email) {
        const emailResult = await sendPaymentRejectionEmail(user.email, user.name, {
          bookingId: id,
          items: booking.items,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalCost: booking.totalCost
        }, rejectionReason);

        if (!emailResult.success) {
          console.error('Failed to send rejection email:', emailResult.error);
        }
      }

      res.json({ message: 'Payment rejected and booking cancelled. Customer notified via email.' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(\+?63|0)?9\d{9}$/;
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleanPhone);
};

// Socket.IO
const userSockets = new Map();
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });
  socket.on('disconnect', () => {
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public", "images");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// USER ENDPOINTS
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({ message: 'Invalid Philippine phone number format' });
    }

    const users = db.collection('users');
    
    // Check if email already exists
    if (await users.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create user with all information
    const result = await users.insertOne({ 
      name, 
      email, 
      password, 
      phone: phone.replace(/[\s\-()]/g, ''), // Clean phone format
      address,
      role: "user", 
      emailVerified: false,
      otp,
      otpExpiry,
      createdAt: new Date() 
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name);
    
    if (!emailResult.success) {
      // Delete the user if email fails to send
      await users.deleteOne({ _id: result.insertedId });
      return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
    }

    res.json({ 
      message: 'Signup successful. Please check your email for OTP verification.', 
      userId: result.insertedId 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Verify OTP Endpoint
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check if OTP expired
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark email as verified and clear OTP
    await users.updateOne(
      { _id: user._id },
      { 
        $set: { emailVerified: true },
        $unset: { otp: "", otpExpiry: "" }
      }
    );

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Resend OTP Endpoint
app.post('/api/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const users = db.collection('users');
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Update OTP in database
    await users.updateOne(
      { _id: user._id },
      { $set: { otp, otpExpiry } }
    );

    // Send new OTP email
    const emailResult = await sendOTPEmail(email, otp, user.name);
    
    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection('users').findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified (skip check for admin)
    if (user.role !== 'admin' && !user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in. Check your inbox for the OTP.' });
    }

    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user._id.toString(), 
        email: user.email, 
        name: user.name, 
        role: user.role || "user" 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/profile/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      full_name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'user',
      emailVerified: user.emailVerified || false
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

app.put('/api/profile/:id', async (req, res) => {
  try {
    const { full_name, phone, address } = req.body;
    const updateFields = { name: full_name };
    
    if (phone) {
      if (!validatePhoneNumber(phone)) {
        return res.status(400).json({ message: 'Invalid Philippine phone number format' });
      }
      updateFields.phone = phone.replace(/[\s\-()]/g, '');
    }
    
    if (address) {
      updateFields.address = address;
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields }
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get all users (for admin)
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      full_name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      address: user.address || 'N/A',
      role: user.role || 'user',
      email_verified: user.emailVerified || false,
      created_at: user.createdAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// EQUIPMENT ENDPOINTS
app.get('/api/equipment', async (req, res) => {
  try {
    const equipments = await db.collection('equipments').find().toArray();
    res.json(equipments);
  } catch {
    res.status(500).json({ message: 'Error fetching equipment' });
  }
});

app.get('/api/equipment/:id', async (req, res) => {
  try {
    const equipment = await db.collection('equipments').findOne({ _id: new ObjectId(req.params.id) });
    if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
    res.json(equipment);
  } catch {
    res.status(500).json({ message: 'Error fetching equipment' });
  }
});

app.post("/api/equipment", upload.single("image"), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file;
    const result = await db.collection("equipments").insertOne({
      name: body.name,
      category: body.category,
      description: body.description || '',
      price_per_day: parseFloat(body.price_per_day),
      available_quantity: parseInt(body.available_quantity),
      featured: body.featured === "true" || false,
      available: true,
      image: file ? `/images/${file.filename}` : "/images/placeholder.svg",
      createdAt: new Date(),
    });
    res.json({ message: "Equipment added successfully", id: result.insertedId });
  } catch {
    res.status(500).json({ message: "Error adding equipment" });
  }
});

app.put("/api/equipment/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const file = req.file;
    const updateFields = {
      name: body.name,
      category: body.category,
      description: body.description || '',
      price_per_day: parseFloat(body.price_per_day),
      available_quantity: parseInt(body.available_quantity),
      featured: body.featured === "true",
      available: body.available !== "false",
      updatedAt: new Date(),
    };
    if (file) updateFields.image = `/images/${file.filename}`;
    const result = await db.collection("equipments").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    if (!result.matchedCount) return res.status(404).json({ message: "Equipment not found" });
    res.json({ message: "Equipment updated successfully" });
  } catch {
    res.status(500).json({ message: "Error updating equipment" });
  }
});

app.delete("/api/equipment/:id", async (req, res) => {
  try {
    const result = await db.collection("equipments").deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ message: "Equipment not found" });
    res.json({ message: "Equipment deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting equipment" });
  }
});

// PACKAGE ENDPOINTS
app.get("/api/packages", async (req, res) => {
  try {
    const packages = await db.collection("packages").find().toArray();
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching packages" });
  }
});

app.get("/api/packages/:id", async (req, res) => {
  try {
    const pkg = await db.collection("packages").findOne({ _id: new ObjectId(req.params.id) });
    if (!pkg) return res.status(404).json({ message: "Package not found" });
    res.json(pkg);
  } catch {
    res.status(500).json({ message: "Error fetching package" });
  }
});

app.post("/api/packages", upload.single("image"), async (req, res) => {
  try {
    const body = req.body;
    const file = req.file;
    const packageData = {
      name: body.name,
      description: body.description || "",
      price: parseFloat(body.price),
      pax: parseInt(body.pax),
      category: body.category || "General",
      available_quantity: parseInt(body.available_quantity) || 1,
      image: file ? `/images/${file.filename}` : "/images/placeholder.svg",
      items: body.items ? body.items.split("\n").map(i => i.trim()).filter(Boolean) : [],
      tableChairs: body.tableChairs ? body.tableChairs.split("\n").map(i => i.trim()).filter(Boolean) : [],
      cateringEquipment: body.cateringEquipment ? body.cateringEquipment.split("\n").map(i => i.trim()).filter(Boolean) : [],
      extras: body.extras ? body.extras.split("\n").map(i => i.trim()).filter(Boolean) : [],
      createdAt: new Date(),
    };
    const result = await db.collection("packages").insertOne(packageData);
    res.json({ message: "Package added successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error adding package:", error);
    res.status(500).json({ message: "Error adding package" });
  }
});

app.put("/api/packages/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const file = req.file;
    const updateFields = {
      name: body.name,
      description: body.description || "",
      price: parseFloat(body.price),
      pax: parseInt(body.pax),
      category: body.category,
      available_quantity: parseInt(body.available_quantity) || 1,
      items: body.items ? body.items.split("\n").map(i => i.trim()).filter(Boolean) : [],
      tableChairs: body.tableChairs ? body.tableChairs.split("\n").map(i => i.trim()).filter(Boolean) : [],
      cateringEquipment: body.cateringEquipment ? body.cateringEquipment.split("\n").map(i => i.trim()).filter(Boolean) : [],
      extras: body.extras ? body.extras.split("\n").map(i => i.trim()).filter(Boolean) : [],
      updatedAt: new Date(),
    };
    if (file) updateFields.image = `/images/${file.filename}`;
    const result = await db.collection("packages").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    if (!result.matchedCount) return res.status(404).json({ message: "Package not found" });
    res.json({ message: "Package updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating package" });
  }
});

app.delete("/api/packages/:id", async (req, res) => {
  try {
    const result = await db.collection("packages").deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ message: "Package not found" });
    res.json({ message: "Package deleted successfully" });
  } catch {
    res.status(500).json({ message: "Error deleting package" });
  }
});
// /api/bookings GET endpoint
app.get('/api/bookings', async (req, res) => {
  try {
    const { userId } = req.query;
    const bookings = db.collection('bookings');
    
    // Build query
    const query = userId ? { userId } : {};
    
    // Fetch bookings
    const results = await bookings.find(query).sort({ bookedAt: -1 }).toArray();
    
    console.log(`Fetched ${results.length} bookings${userId ? ` for user ${userId}` : ''}`);
    
    // Enrich with user data
    const enriched = await Promise.all(results.map(async (b) => {
      const user = await db.collection('users').findOne({ _id: new ObjectId(b.userId) });
      
      const enrichedBooking = {
        id: b._id.toString(),
        user_id: b.userId,
        start_date: b.startDate,
        end_date: b.endDate,
        items: b.items || [],
        total_price: b.totalCost,
        status: b.status || "pending",
        notes: b.notes || "",
        additional_payment: b.additional_payment || null,
        issue_notes: b.issue_notes || null,
        paymentMethod: b.paymentMethod || null,
        paymentStatus: b.paymentStatus || null,
        proofOfPayment: b.proofOfPayment || null,
        rejectionReason: b.rejectionReason || null,
        bookedAt: b.bookedAt,
        profiles: user ? { full_name: user.name } : null
      };
      
      // Debug log for GCash bookings
      if (b.paymentMethod === 'gcash') {
        console.log('GCash Booking Found:', {
          id: enrichedBooking.id,
          paymentMethod: enrichedBooking.paymentMethod,
          paymentStatus: enrichedBooking.paymentStatus,
          hasProof: !!enrichedBooking.proofOfPayment
        });
      }
      
      return enrichedBooking;
    }));
    
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

app.get('/api/bookings/debug/payment-verification', async (req, res) => {
  try {
    const bookings = db.collection('bookings');
    
    // Get all bookings
    const allBookings = await bookings.find({}).toArray();
    
    // Filter for GCash payments
    const gcashBookings = allBookings.filter(b => b.paymentMethod === "gcash");
    
    // Filter for pending verification
    const pendingVerification = allBookings.filter(
      b => b.paymentMethod === "gcash" && b.paymentStatus === "pending_verification"
    );
    
    // Get detailed info
    const diagnostics = {
      totalBookings: allBookings.length,
      gcashPayments: gcashBookings.length,
      pendingVerification: pendingVerification.length,
      pendingVerificationDetails: pendingVerification.map(b => ({
        id: b._id.toString(),
        userId: b.userId,
        paymentMethod: b.paymentMethod,
        paymentStatus: b.paymentStatus,
        proofOfPayment: b.proofOfPayment,
        hasProof: !!b.proofOfPayment,
        status: b.status,
        totalCost: b.totalCost,
        itemCount: b.items?.length || 0
      })),
      allPaymentStatuses: [...new Set(allBookings.map(b => b.paymentStatus))],
      allPaymentMethods: [...new Set(allBookings.map(b => b.paymentMethod))]
    };
    
    res.json(diagnostics);
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ message: 'Error running diagnostics', error: error.message });
  }
});
// Helper function to send booking receipt email
const sendBookingReceiptEmail = async (userEmail, userName, bookingDetails) => {
  const { bookingId, items, startDate, endDate, totalCost, paymentMethod, rentalDays } = bookingDetails;
  
  const itemsList = items.map(item => {
    if (item.type === 'equipment') {
      return `<li>${item.equipmentName} - Qty: ${item.quantity} × ₱${item.pricePerDay}/day × ${rentalDays} days = ₱${item.itemTotalCost.toFixed(2)}</li>`;
    } else {
      return `<li>${item.packageName} - Qty: ${item.quantity} × ₱${item.packagePrice} (flat) = ₱${item.itemTotalCost.toFixed(2)}</li>`;
    }
  }).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Remrose - Booking Confirmation #${bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #7c3aed;">
          <h1 style="color: #7c3aed; margin: 0;">Remrose Rentals</h1>
          <p style="color: #6b7280; margin: 5px 0;">Booking Confirmation</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h2 style="color: #1f2937;">Hello ${userName}!</h2>
          <p style="color: #4b5563;">Thank you for your booking. Your payment has been confirmed and your booking is now approved.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Rental Period:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${rentalDays} ${rentalDays === 1 ? 'day' : 'days'}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod === 'gcash' ? 'GCash' : 'Cash on Pickup'}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #1f2937;">Rented Items:</h3>
            <ul style="color: #4b5563;">
              ${itemsList}
            </ul>
          </div>

          <div style="background-color: #7c3aed; color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <h2 style="margin: 0;">Total Amount: ₱${totalCost.toFixed(2)}</h2>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; color: #92400e;"><strong>Important:</strong> Please bring this receipt and a valid ID when picking up your items.</p>
          </div>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <div style="text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">For inquiries, contact us at:</p>
          <p style="color: #7c3aed; font-weight: bold; margin: 5px 0;">remrose.rentals@gmail.com</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">This is an automated message from Remrose. Please do not reply.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Receipt email sending error:', error);
    return { success: false, error };
  }
};

app.post("/api/book", upload.single("proofOfPayment"), async (req, res) => {
  try {
    const { userId, startDate, endDate, cartItems, notes, paymentMethod, totalAmount } = req.body;
    const proofOfPaymentFile = req.file;

    // Validation
    if (!userId || !startDate || !endDate || !cartItems || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let parsedCartItems;
    try {
      parsedCartItems = JSON.parse(cartItems);
    } catch (parseError) {
      return res.status(400).json({ message: "Invalid cart items format" });
    }

    if (!Array.isArray(parsedCartItems) || parsedCartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const equipments = db.collection("equipments");
    const packages = db.collection("packages");
    const bookings = db.collection("bookings");
    const users = db.collection("users");

    // Calculate rental days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    let totalCost = 0;
    const itemsToBook = [];

    // ✅ Process each cart item
    for (const item of parsedCartItems) {
      const requestedQty = parseInt(item.quantity);

      if (item.type === "equipment") {
        // Find equipment
        const equipment = await equipments.findOne({ _id: new ObjectId(item.equipmentId) });
        if (!equipment) {
          return res.status(404).json({ message: `Equipment not found: ${item.equipmentId}` });
        }
        
        // Check availability
        if (equipment.available_quantity < requestedQty) {
          return res.status(400).json({ 
            message: `Not enough stock for ${equipment.name}. Available: ${equipment.available_quantity}, Requested: ${requestedQty}` 
          });
        }
        
        // Calculate cost
        const cost = days * equipment.price_per_day * requestedQty;
        totalCost += cost;
        
        // Add to booking items
        itemsToBook.push({
          type: "equipment",
          equipmentId: item.equipmentId,
          equipmentName: equipment.name,
          quantity: requestedQty,
          pricePerDay: equipment.price_per_day,
          itemTotalCost: cost,
        });
        
        // Deduct equipment quantity
        await equipments.updateOne(
          { _id: new ObjectId(item.equipmentId) },
          { $inc: { available_quantity: -requestedQty } }
        );
      }

      if (item.type === "package") {
        // Find package
        const pkg = await packages.findOne({ _id: new ObjectId(item.packageId) });
        if (!pkg) {
          return res.status(404).json({ message: `Package not found: ${item.packageId}` });
        }
        
        // Check package availability
        const availableQty = pkg.available_quantity || 0;
        if (availableQty < requestedQty) {
          return res.status(400).json({ 
            message: `Not enough stock for ${pkg.name}. Available: ${availableQty}, Requested: ${requestedQty}` 
          });
        }
        
        // Calculate cost (packages are flat-rate)
        const cost = pkg.price * requestedQty;
        totalCost += cost;
        
        // Add to booking items
        itemsToBook.push({
          type: "package",
          packageId: item.packageId,
          packageName: pkg.name,
          quantity: requestedQty,
          packagePrice: pkg.price,
          itemTotalCost: cost,
        });

        // ✅ Deduct package quantity
        await packages.updateOne(
          { _id: new ObjectId(item.packageId) },
          { $inc: { available_quantity: -requestedQty } }
        );
      }
    }

    // Determine booking and payment status
    let bookingStatus = "pending";
    let paymentStatus = "pending";
    
    if (paymentMethod === "cash") {
      paymentStatus = "unpaid";
    } else if (paymentMethod === "gcash") {
      paymentStatus = "pending_verification";
    }

    // Create booking document
    const bookingData = {
      userId,
      startDate,
      endDate,
      items: itemsToBook,
      totalCost,
      notes: notes || "",
      status: bookingStatus,
      paymentMethod,
      paymentStatus,
      bookedAt: new Date(),
    };

    // Add proof of payment if GCash
    if (paymentMethod === "gcash" && proofOfPaymentFile) {
      bookingData.proofOfPayment = `/images/${proofOfPaymentFile.filename}`;
    }

    const result = await bookings.insertOne(bookingData);
    const bookingId = result.insertedId.toString();

    // If cash payment, send receipt immediately
    if (paymentMethod === "cash") {
      const user = await users.findOne({ _id: new ObjectId(userId) });
      if (user && user.email) {
        await sendBookingReceiptEmail(user.email, user.name, {
          bookingId,
          items: itemsToBook,
          startDate,
          endDate,
          totalCost,
          paymentMethod,
          rentalDays: days
        });
      }
    }

    res.json({ 
      message: paymentMethod === "gcash" 
        ? "Booking submitted! Your payment is under review. You'll receive a confirmation email once approved." 
        : "Booking successful! Check your email for the receipt.",
      bookingId 
    });

  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: error.message || "Error creating booking" });
  }
});


app.put('/api/bookings/:id/verify-payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    const bookings = db.collection('bookings');
    const users = db.collection('users');
    const equipments = db.collection('equipments');
    const packages = db.collection('packages');

    const booking = await bookings.findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus !== 'pending_verification') {
      return res.status(400).json({ message: 'This booking is not pending payment verification' });
    }

    if (approved) {
      // ✅ Approve payment
      await bookings.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            paymentStatus: 'paid',
            status: 'confirmed',
            paymentVerifiedAt: new Date()
          } 
        }
      );

      // Send receipt email
      const user = await users.findOne({ _id: new ObjectId(booking.userId) });
      if (user && user.email) {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

        await sendBookingReceiptEmail(user.email, user.name, {
          bookingId: id,
          items: booking.items,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalCost: booking.totalCost,
          paymentMethod: booking.paymentMethod,
          rentalDays: days
        });
      }

      res.json({ message: 'Payment verified and booking confirmed. Receipt sent to customer.' });
    } else {
      // ✅ Reject payment - restore quantities for BOTH equipment AND packages
      if (booking.items && booking.items.length > 0) {
        for (const item of booking.items) {
          if (item.type === 'equipment') {
            await equipments.updateOne(
              { _id: new ObjectId(item.equipmentId) },
              { $inc: { available_quantity: item.quantity } }
            );
          } else if (item.type === 'package') {
            await packages.updateOne(
              { _id: new ObjectId(item.packageId) },
              { $inc: { available_quantity: item.quantity } }
            );
          }
        }
      }

      await bookings.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            paymentStatus: 'rejected',
            status: 'cancelled',
            rejectionReason: rejectionReason || 'Payment verification failed',
            rejectedAt: new Date()
          } 
        }
      );

      res.json({ message: 'Payment rejected and booking cancelled. Quantities restored.' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});
app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    if (!result.matchedCount) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status' });
  }
});

app.put('/api/bookings/:id/resolve-issue', async (req, res) => {
  try {
    const { id } = req.params;
    const { additional_payment, issue_notes, status } = req.body;
    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          additional_payment: parseFloat(additional_payment) || 0,
          issue_notes,
          status,
          resolvedAt: new Date()
        } 
      }
    );
    if (!result.matchedCount) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json({ message: 'Issue resolved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resolving issue' });
  }
});

// Replace the /api/bookings/:id/cancel endpoint with this fixed version

app.put('/api/bookings/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = db.collection('bookings');
    const equipments = db.collection('equipments');
    const packages = db.collection('packages');

    const booking = await bookings.findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }

    // ✅ Restore quantities for BOTH equipment and packages
    if (booking.items && booking.items.length > 0) {
      for (const item of booking.items) {
        if (item.type === 'equipment') {
          await equipments.updateOne(
            { _id: new ObjectId(item.equipmentId) },
            { $inc: { available_quantity: item.quantity } }
          );
        } else if (item.type === 'package') {
          await packages.updateOne(
            { _id: new ObjectId(item.packageId) },
            { $inc: { available_quantity: item.quantity } }
          );
        }
      }
    }

    await bookings.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'cancelled', cancelledAt: new Date() } }
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Error cancelling booking' });
  }
});
// MESSAGING ENDPOINTS (Keep existing code - no changes needed)
app.get('/api/messages/conversations', async (req, res) => {
  try {
    const messages = db.collection('messages');
    const allMessages = await messages.find({
      $or: [{ senderId: 'admin' }, { receiverId: 'admin' }]
    }).sort({ createdAt: -1 }).toArray();

    const conversationsMap = new Map();
    for (const msg of allMessages) {
      const userId = msg.senderId === 'admin' ? msg.receiverId : msg.senderId;
      if (!conversationsMap.has(userId)) {
        const unreadCount = await messages.countDocuments({
          senderId: userId,
          receiverId: 'admin',
          read: false
        });
        conversationsMap.set(userId, {
          userId,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());
    const enriched = await Promise.all(conversations.map(async (conv) => {
      const user = await db.collection('users').findOne({ _id: new ObjectId(conv.userId) });
      return {
        userId: conv.userId,
        userName: user?.name || 'Unknown User',
        userEmail: user?.email || '',
        lastMessage: conv.lastMessage,
        lastMessageTime: conv.lastMessageTime,
        unreadCount: conv.unreadCount
      };
    }));

    enriched.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    res.json(enriched);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = db.collection('messages');
    const messageList = await messages
      .find({
        $or: [
          { senderId: userId, receiverId: 'admin' },
          { senderId: 'admin', receiverId: userId }
        ]
      })
      .sort({ createdAt: 1 })
      .toArray();
    res.json(messageList);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});
app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const messages = db.collection('messages');
    const result = await messages.insertOne({
      senderId,
      receiverId,
      message,
      read: false,
      createdAt: new Date()
    });
    const newMessage = await messages.findOne({ _id: result.insertedId });
    const receiverSocketId = userSockets.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }
    res.json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

app.put('/api/messages/read/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.query;
    const messages = db.collection('messages');
    let updateQuery;
    if (isAdmin === 'true') {
      updateQuery = { senderId: userId, receiverId: 'admin', read: false };
    } else {
      updateQuery = { senderId: 'admin', receiverId: userId, read: false };
    }
    const result = await messages.updateMany(updateQuery, { $set: { read: true } });
    console.log(`Marked ${result.modifiedCount} messages as read for ${userId}`);
    res.json({ message: 'Messages marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

app.get('/api/messages/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = db.collection('messages');
    const count = await messages.countDocuments({
      receiverId: userId,
      read: false
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});