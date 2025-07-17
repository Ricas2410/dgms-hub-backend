const express = require('express');
const jwt = require('jsonwebtoken');
const { User, AuditLog } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { validateUserLogin } = require('../middleware/validation');

const router = express.Router();

// Login endpoint
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Find user by email
    const user = await User.findByEmail(email);
    
    if (!user) {
      // Log failed login attempt
      await AuditLog.logAction({
        action: 'LOGIN',
        entityType: 'SYSTEM',
        userId: null,
        ipAddress,
        userAgent,
        description: `Failed login attempt for email: ${email}`,
        metadata: { reason: 'User not found' }
      }).catch(console.error);

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      // Log failed login attempt
      await AuditLog.logAction({
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        userId: user.id,
        ipAddress,
        userAgent,
        description: `Failed login attempt for user: ${user.username}`,
        metadata: { reason: 'Invalid password' }
      }).catch(console.error);

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Log successful login
    await AuditLog.logAction({
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      userId: user.id,
      ipAddress,
      userAgent,
      description: `Successful login for user: ${user.username}`
    }).catch(console.error);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Log logout
    await AuditLog.logAction({
      action: 'LOGOUT',
      entityType: 'USER',
      entityId: req.user.id,
      userId: req.user.id,
      ipAddress,
      userAgent,
      description: `User logged out: ${req.user.username}`
    }).catch(console.error);

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    }
  });
});

// Refresh token endpoint
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token
    const token = jwt.sign(
      { 
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
});

module.exports = router;
