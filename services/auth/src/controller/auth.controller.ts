
import ErrorHandler from '../utils/errorHandler.js';
import bcrypt from 'bcrypt';
import { TryCatch } from '../utils/Trycatch.js'
import { sql } from '../utils/db.js';

export const registerUser = TryCatch(async(req,res,next)=>{
    const {name, email, password, phoneNumber,role,bio} = req.body;

    if(!name|| !email || !password || !phoneNumber || !role || !bio){
        throw new ErrorHandler(400,'Name ,email , password ,phonenumber, role and bio is missing')
    }

    const exisitingUser = await sql`SELECT user_id FROM users WHERE email=${email}`;

    if(exisitingUser.length>0){
        throw new ErrorHandler(409,'User with this email already exists');
    }

    const hashPassword = await bcrypt.hash(password,10)

    let registerdUser;

    if(role==='recruiter'){
        const [user] = await sql`INSERT INTO users (name, email, hashPassword, phone_number,role)
                    VALUES (${name}, ${email}, ${hashPassword},${phoneNumber},${role})
                    RETURNING user_id,name, email, phone_number, role, created_at
        `;
        registerdUser = user;
    }
    else if (role === 'jobseeker'){
        // const file = req.file

    }
    
    res.status(200).json({
        success:'true',
        email
    })
})