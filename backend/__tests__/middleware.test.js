const jwt = require('jsonwebtoken');
const { User } = require('../src/models');
const authMiddleware = require('../src/middleware/authMiddleware');

describe('Auth Middleware', () => {
  let req, res, next;
  let testUser;

  beforeAll(async () => {
    // Clear users
    await User.destroy({ where: {} });

    // Create test user
    testUser = await User.create({
      username: 'middlewaretester',
      email: 'middleware@example.com',
      password: 'Password123'
    });
  });

  beforeEach(() => {
    // Mock request, response, next
    req = {
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  it('should reject requests without authorization header', async () => {
    await authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject requests with invalid token format', async () => {
    req.headers.authorization = 'InvalidFormat';
    
    await authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject requests with invalid token', async () => {
    req.headers.authorization = 'Bearer invalidtoken123';
    
    await authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject token with non-existent user', async () => {
    const token = jwt.sign(
      { id: 9999, username: 'nonexistent' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    req.headers.authorization = `Bearer ${token}`;
    
    await authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow valid requests and attach user', async () => {
    const token = jwt.sign(
      { id: testUser.id, username: testUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    req.headers.authorization = `Bearer ${token}`;
    
    await authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toEqual(testUser.id);
    expect(req.user.username).toEqual(testUser.username);
  });

  it('should handle expired tokens properly', async () => {
    // Create a token that's already expired
    const token = jwt.sign(
      { id: testUser.id, username: testUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '0s' } // Expire immediately
    );
    
    // Wait a bit to ensure token expires
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    req.headers.authorization = `Bearer ${token}`;
    
    await authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token expired'
    }));
    expect(next).not.toHaveBeenCalled();
  });
});