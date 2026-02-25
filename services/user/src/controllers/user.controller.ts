import { AuthenticatedRequest } from "middleware/auth.js";
import { TryCatch } from "../utils/TryCatch.js";
import { sql } from "../utils/db.js";


export const myProfile = TryCatch(async(req:AuthenticatedRequest,res,next)=>{

    const user = req.user;

    res.json(user);
});


export const getUserProfile = TryCatch(async (req, res, next) => {
    const { userID } = req.params;

    if (!userID || isNaN(Number(userID))) {
        res.status(400).json({
        success: false,
        message: "Invalid or missing user ID",
        });
        return;
    }

    const users = await sql`
        SELECT
        u.user_id,
        u.name,
        u.email,
        u.phone_number,
        u.role,
        u.bio,
        u.resume,
        u.resume_public_id,
        u.profile_pic,
        u.profile_pic_public_id,
        u.subscription,
        ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
        FROM users u
        LEFT JOIN user_skills us ON u.user_id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.skill_id
        WHERE u.user_id = ${Number(userID)}
        GROUP BY u.user_id;
    `;

    if (users.length === 0) {
        res.status(404).json({
        success: false,
        message: "User not found",
        });
        return;
    }

    const user = users[0];
    user.skills = user.skills ?? [];

    res.status(200).json({
        success: true,
        user,
    });
});


export const updateUserProfile = TryCatch(async (req:AuthenticatedRequest, res, next) => {
  const user = req.user!;

  const { name, phone_number, bio } = req.body;

  if (!name && !phone_number && !bio) {
    res.status(400).json({
      success: false,
      message: "At least one field is required to update",
    });
    return;
  }

  await sql`
    UPDATE users
    SET
      name         = COALESCE(${name ?? null}, name),
      phone_number = COALESCE(${phone_number ?? null}, phone_number),
      bio          = COALESCE(${bio ?? null}, bio)
    WHERE user_id = ${user.user_id};
  `;

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});