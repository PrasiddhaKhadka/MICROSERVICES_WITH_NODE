
import ErrorHandler from '../utils/errorHandler.js';
import bcrypt from 'bcrypt';
import getBuffer from '../utils/buffer.js';
import axios from 'axios';
import jwt, { SignOptions } from 'jsonwebtoken';
import { TryCatch } from '../utils/TryCatch.js'
import { sql } from '../utils/db.js';
import { resetPasswordTemplate } from '../reset_pass.template.js';
import { publishToTopic } from '../producer.js';
import { redisClient } from '../index.js';


export const registerUser = TryCatch(async (req, res, next) => {
    const { name, email, password, phoneNumber, bio } = req.body;
    const role = req.body.role?.trim().toLowerCase(); // normalize

    if (!name || !email || !password || !phoneNumber || !role || !bio) {
        throw new ErrorHandler(400, 'Name, email, password, phoneNumber, role and bio are required');
    }

    if (!['recruiter', 'jobseeker'].includes(role)) {
        throw new ErrorHandler(400, `Invalid role "${role}". Must be "recruiter" or "jobseeker"`);
    }

    const existingUser = await sql`SELECT user_id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
        throw new ErrorHandler(409, 'User with this email already exists');
    }

    const hashPassword = await bcrypt.hash(password, 10);
    let registeredUser;

    if (role === 'recruiter') {
        const [user] = await sql`
            INSERT INTO users (name, email, password, phone_number, role, bio)
            VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}, ${bio})
            RETURNING user_id, name, email, phone_number, role, bio, created_at
        `;
        registeredUser = user;

    } else if (role === 'jobseeker') {
        const file = req.file;
        if (!file) {
            throw new ErrorHandler(400, 'Resume file is required for jobseekers');
        }

        const fileBuffer = getBuffer(file);
        if (!fileBuffer?.content) {
            throw new ErrorHandler(500, 'Failed to generate buffer');
        }

        const { data } = await axios.post(
            `${process.env.UPLOAD_SERVICE}/api/v1/utils/upload`,
            { buffer: fileBuffer.content }
        );

        const [user] = await sql`
            INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id)
            VALUES (${name}, ${email}, ${hashPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id})
            RETURNING user_id, name, email, phone_number, role, bio, resume, created_at
        `;
        registeredUser = user;
    }

    // Safety net — should never reach here due to role check above
    if (!registeredUser) {
        throw new ErrorHandler(500, 'User registration failed unexpectedly');
    }

    const user = {
        user_id:registeredUser.user_id,
        email:registeredUser.email
    }

    const token = jwt.sign(
    user,
    process.env.JWT_SECRET as string,
        {
            expiresIn: process.env.JWT_EXPIRATION as SignOptions['expiresIn']
        }
    );

    res.status(201).json({
        success: true,          
        registeredUser,
        token
    });
});


export const loginUser = TryCatch(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ErrorHandler(400, 'Email and password are required');
    }

    const [existingUser] = await sql`
        SELECT 
            u.user_id, u.name, u.email, u.password, u.phone_number, 
            u.role, u.bio, u.resume, u.profile_pic, u.created_at,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT('skill_id', s.skill_id, 'name', s.name)
                ) FILTER (WHERE s.skill_id IS NOT NULL),
                '[]'
            ) AS skills
        FROM users u
        LEFT JOIN user_skills us ON u.user_id = us.user_id
        LEFT JOIN skills s ON us.skills_id = s.skill_id
        WHERE u.email = ${email}
        GROUP BY u.user_id
    `;

    if (!existingUser) {
        throw new ErrorHandler(404, 'No account found with this email');
    }

    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordMatch) {
        throw new ErrorHandler(401, 'Invalid credentials');
    }

    const payload = {
        user_id: existingUser.user_id,
        email: existingUser.email,
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        {
            expiresIn: process.env.JWT_EXPIRATION as SignOptions['expiresIn'],
        }
    );

    // strip password before sending back
    const { password: _, ...user } = existingUser;

    res.status(200).json({
        success: true,
        token,
        user,
    });
});




export const forgotPassword = TryCatch(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        throw new ErrorHandler(400, 'Email is required');
    }

    const [existingUser] = await sql`
        SELECT user_id, name, email FROM users WHERE email = ${email}
    `;

    if (!existingUser) {
        throw new ErrorHandler(404, 'No account found with this email');
    }

    const payload = {
        user_id: existingUser.user_id,
        email: existingUser.email,
        type:"reset",
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        {
            expiresIn: '15m',
        }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

     await redisClient.set(`forgot:${email}`, token, { EX: 900 });

    
    const message = {
        to:email,
        subject:'Rest your password: JobPortal',
        html:resetPasswordTemplate(email,resetLink)
    }

    publishToTopic("send-mail",message).catch((e)=>{
        console.log('failed to send message',e)
    })

    res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email',
    });
});


export const resetPassword = TryCatch(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    let decoded: any;

    try {
        decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
    } catch (error) {
        throw new ErrorHandler(400, "Invalid token type");
    }

   
    if (decoded.type !== "reset") {
        throw new ErrorHandler(400, "Invalid token type");
    }

    const email = decoded.email;

    const storedToken = await redisClient.get(`forgot:${email}`);
    if (!storedToken || storedToken !== token) {
        throw new ErrorHandler(400, "Token has been expired");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await sql`
        UPDATE users
        SET password = ${hashedPassword}
        WHERE email = ${email}
        RETURNING id, email
    `;

    if (user.length === 0) {
        throw new ErrorHandler(404, "User not found");
    }

    // Invalidate the token after successful reset
    await redisClient.del(`forgot:${email}`);

    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});