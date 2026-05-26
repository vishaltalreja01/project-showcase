import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendVerificationEmail, sendPasswordResetEmail, sendInstructorApprovalEmail, sendInstructorRejectionEmail } from '../services/email.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from './notification.controller';

const ALLOWED_EMAIL_DOMAIN = '@iba-suk.edu.pk';

// Generate JWT Token
const generateToken = (id: string, role: string): string => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.sign({ id, role }, jwtSecret, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        // Validate email domain
        if (!email || !email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
            res.status(400).json({
                success: false,
                message: `Only university emails (${ALLOWED_EMAIL_DOMAIN}) are allowed to register`
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // If user exists but is not verified, allow re-registration
            if (!existingUser.isVerified) {
                // Generate new verification token
                const token = existingUser.generateVerificationToken();
                await existingUser.save();

                // Send verification email
                try {
                    await sendVerificationEmail(email, existingUser.name, token);
                } catch (emailError) {
                    console.error('Failed to resend verification email during signup:', emailError);

                    res.status(202).json({
                        success: true,
                        message: 'Account exists but the verification email could not be sent. Please try resending it later.',
                        needsVerification: true
                    });
                    return;
                }

                res.status(200).json({
                    success: true,
                    message: 'Verification email resent. Please check your inbox.',
                    needsVerification: true
                });
                return;
            }

            res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
            return;
        }

        // Create new user (unverified, instructors need admin approval)
        const user = await User.create({
            name,
            email,
            password,
            role,
            isVerified: false,
            isApproved: role === 'instructor' ? false : true
        });

        // Generate verification token
        const token = user.generateVerificationToken();
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, name, token);
        } catch (emailError) {
            console.error('Failed to send verification email during signup:', emailError);

            res.status(202).json({
                success: true,
                message: 'Account created, but the verification email could not be sent. Please try resending it later.',
                needsVerification: true
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: 'Account created! Please check your email to verify your account.',
            needsVerification: true
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during signup'
        });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
            return;
        }

        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        // If instructor verified, notify admins for approval
        if (user.role === 'instructor') {
            try {
                const admins = await User.find({ role: 'admin' });
                for (const admin of admins) {
                    await createNotification(
                        admin._id.toString(),
                        'new_instructor',
                        'New Instructor Registration',
                        `${user.name} (${user.email}) has verified their email and is awaiting approval.`,
                        user._id.toString()
                    );
                }
            } catch (notifError) {
                console.error('Failed to create instructor notification:', notifError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });
    } catch (error: any) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during email verification'
        });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not
            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a verification email has been sent.'
            });
            return;
        }

        if (user.isVerified) {
            res.status(400).json({
                success: false,
                message: 'This email is already verified'
            });
            return;
        }

        // Generate new verification token
        const token = user.generateVerificationToken();
        await user.save();

        // Send verification email
        await sendVerificationEmail(email, user.name, token);

        res.status(200).json({
            success: true,
            message: 'Verification email sent. Please check your inbox.'
        });
    } catch (error: any) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during resend verification'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        // Check if email is verified
        if (!user.isVerified) {
            res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
                needsVerification: true,
                email: user.email
            });
            return;
        }

        // Check if instructor is approved
        if (user.role === 'instructor' && !user.isApproved) {
            res.status(403).json({
                success: false,
                message: 'Your instructor account is pending admin approval. You will be notified once approved.',
                pendingApproval: true
            });
            return;
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString(), user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during login'
        });
    }
};

// @desc    Get all instructors (for dropdown in project upload)
// @route   GET /api/auth/instructors
// @access  Public
export const getInstructors = async (req: Request, res: Response): Promise<void> => {
    try {
        const instructors = await User.find({ role: 'instructor', isVerified: true, isApproved: true }).select('name email');

        res.status(200).json({
            success: true,
            data: instructors
        });
    } catch (error: any) {
        console.error('Get instructors error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching instructors'
        });
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, role } = req.body;

        // Fetch user info from Google using the access token
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user info from Google');
        }

        interface GoogleUserInfo {
            name: string;
            email: string;
            picture: string;
            sub: string;
        }

        const data = await response.json() as GoogleUserInfo;
        const { name, email, picture, sub } = data;

        // Validate email domain for Google login
        if (!email || !email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)) {
            res.status(400).json({
                success: false,
                message: `Only university emails (${ALLOWED_EMAIL_DOMAIN}) are allowed to register`
            });
            return;
        }

        let user = await User.findOne({ email });

        if (user) {
            // If user exists but doesn't have googleId, update it
            if (!user.googleId) {
                user.googleId = sub;
                if (picture && !user.avatar) user.avatar = picture;
                user.isVerified = true; // Google-authenticated users are auto-verified
                await user.save();
            }
        } else {
            // Create new user (auto-verified for Google auth)
            const assignedRole = (role === 'instructor') ? 'instructor' : 'student';
            user = await User.create({
                name,
                email,
                role: assignedRole,
                googleId: sub,
                avatar: picture,
                isVerified: true,
                isApproved: assignedRole === 'instructor' ? false : true,
            });

            // If instructor via Google, notify admins
            if (assignedRole === 'instructor') {
                try {
                    const admins = await User.find({ role: 'admin' });
                    for (const admin of admins) {
                        await createNotification(
                            admin._id.toString(),
                            'new_instructor',
                            'New Instructor Registration',
                            `${name} (${email}) registered via Google and is awaiting approval.`,
                            user._id.toString()
                        );
                    }
                } catch (notifError) {
                    console.error('Failed to create instructor notification:', notifError);
                }

                res.status(200).json({
                    success: false,
                    message: 'Your instructor account is pending admin approval. You will be notified once approved.',
                    pendingApproval: true
                });
                return;
            }
        }

        const jwtToken = generateToken(user._id.toString(), user.role);

        res.status(200).json({
            success: true,
            message: 'Google login successful',
            data: {
                token: jwtToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            }
        });
    } catch (error: any) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Google authentication failed'
        });
    }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not
            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
            return;
        }

        if (user.googleId && !user.password) {
            res.status(400).json({
                success: false,
                message: 'This account uses Google Sign-In. Please login with Google.'
            });
            return;
        }

        // Generate password reset token
        const token = user.generatePasswordResetToken();
        await user.save();

        // Send password reset email
        await sendPasswordResetEmail(email, user.name, token);

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error: any) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during forgot password'
        });
    }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token'
            });
            return;
        }

        // Set new password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now log in with your new password.'
        });
    } catch (error: any) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error during password reset'
        });
    }
};

// @desc    Get pending instructors (admin)
// @route   GET /api/auth/admin/pending-instructors
// @access  Private (Admin)
export const getPendingInstructors = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const instructors = await User.find({
            role: 'instructor',
            isVerified: true,
            isApproved: false
        }).select('name email createdAt');

        res.status(200).json({
            success: true,
            count: instructors.length,
            data: instructors
        });
    } catch (error: any) {
        console.error('Get pending instructors error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error fetching pending instructors'
        });
    }
};

// @desc    Approve instructor (admin)
// @route   PUT /api/auth/admin/approve-instructor/:id
// @access  Private (Admin)
export const approveInstructor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const instructor = await User.findById(id);

        if (!instructor || instructor.role !== 'instructor') {
            res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
            return;
        }

        if (instructor.isApproved) {
            res.status(400).json({
                success: false,
                message: 'Instructor is already approved'
            });
            return;
        }

        instructor.isApproved = true;
        await instructor.save();

        // Send approval email to instructor
        try {
            await sendInstructorApprovalEmail(instructor.email, instructor.name);
        } catch (emailError) {
            console.error('Failed to send instructor approval email:', emailError);
        }

        // Notify instructor of approval (in-app)
        try {
            await createNotification(
                instructor._id.toString(),
                'project_approved',
                'Account Approved',
                'Your instructor account has been approved! You can now log in.',
                instructor._id.toString()
            );
        } catch (notifError) {
            console.error('Failed to create approval notification:', notifError);
        }

        res.status(200).json({
            success: true,
            message: `Instructor ${instructor.name} approved successfully`,
            data: instructor
        });
    } catch (error: any) {
        console.error('Approve instructor error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error approving instructor'
        });
    }
};

// @desc    Reject instructor (admin) — deletes the account
// @route   DELETE /api/auth/admin/reject-instructor/:id
// @access  Private (Admin)
export const rejectInstructor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const instructor = await User.findById(id);

        if (!instructor || instructor.role !== 'instructor') {
            res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
            return;
        }

        if (instructor.isApproved) {
            res.status(400).json({
                success: false,
                message: 'Cannot reject an already approved instructor'
            });
            return;
        }

        const instructorName = instructor.name;
        const instructorEmail = instructor.email;

        // Delete the instructor account
        await User.findByIdAndDelete(id);

        // Send rejection email
        try {
            await sendInstructorRejectionEmail(instructorEmail, instructorName);
        } catch (emailError) {
            console.error('Failed to send instructor rejection email:', emailError);
        }

        res.status(200).json({
            success: true,
            message: `Instructor ${instructorName} has been rejected and removed`
        });
    } catch (error: any) {
        console.error('Reject instructor error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error rejecting instructor'
        });
    }
};
