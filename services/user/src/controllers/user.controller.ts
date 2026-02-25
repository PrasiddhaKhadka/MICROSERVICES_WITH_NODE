import { AuthenticatedRequest } from "middleware/auth.js";
import { TryCatch } from "../utils/TryCatch.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import getBuffer from "../utils/buffer.js";
import axios from "axios";


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


export const updateProfilePic = TryCatch(async (req: AuthenticatedRequest, res, next) => {
  const user = req.user;

  const file = req.file;

  if (!file) {
    throw new ErrorHandler(400, "No image file provided");
  }

  const oldPublicId = user?.profile_pic_public_id;

  const fileBuffer = getBuffer(file);

  const { data: uploadResult } = await axios.post(
    `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
    {
      buffer: fileBuffer.content,
      public_id: oldPublicId,
    }
  );

  if (!uploadResult || !uploadResult.url) {
    throw new ErrorHandler(500, "Failed to upload image");
  }

  const [updatedUser] = await sql`
    UPDATE users
    SET
      profile_pic           = ${uploadResult.url},
      profile_pic_public_id = ${uploadResult.public_id}
    WHERE user_id = ${user!.user_id}
    RETURNING user_id, name, email, profile_pic, profile_pic_public_id;
  `;

  if (!updatedUser) {
    throw new ErrorHandler(404, "User not found");
  }

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    user: updatedUser,
  });
});



export const updateResume = TryCatch(async (req: AuthenticatedRequest, res, next) => {
  const user = req.user;

  const file = req.file;

  if (!file) {
    throw new ErrorHandler(400, "No resume file provided");
  }

  if (file.mimetype !== "application/pdf") {
    throw new ErrorHandler(400, "Only PDF files are allowed");
  }

  const oldPublicId = user?.resume_public_id;

  const fileBuffer = getBuffer(file);

  const { data: uploadResult } = await axios.post(
    `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
    {
      buffer: fileBuffer.content,
      public_id: oldPublicId,
    }
  );

  if (!uploadResult || !uploadResult.url) {
    throw new ErrorHandler(500, "Failed to upload resume");
  }

  const [updatedUser] = await sql`
    UPDATE users
    SET
      resume           = ${uploadResult.url},
      resume_public_id = ${uploadResult.public_id}
    WHERE user_id = ${user!.user_id}
    RETURNING user_id, name, email, resume, resume_public_id;
  `;

  if (!updatedUser) {
    throw new ErrorHandler(404, "User not found");
  }

  res.status(200).json({
    success: true,
    message: "Resume updated successfully",
    user: updatedUser,
  });
});


export const addSkills = TryCatch(async (req: AuthenticatedRequest, res):Promise<void> => {
  const userId = req.user?.user_id;
  const { skillName } = req.body;

  if (!skillName || skillName.trim() === "") {
    throw new ErrorHandler(400, "Please provide a skill name");
  }

  let wasSkillAdded = false;

  try {
    await sql`BEGIN`;

    const users = await sql`
      SELECT user_id, skills FROM users WHERE user_id = ${userId}
    `;

    if (users.length === 0) {
      await sql`ROLLBACK`;
      throw new ErrorHandler(404, "User not found");
    }

    const user = users[0];
    const normalizedSkill = skillName.trim().toLowerCase();

    if (user.skills && user.skills.map((s:any) => s.toLowerCase()).includes(normalizedSkill)) {
      await sql`ROLLBACK`;
      throw new ErrorHandler(409, "Skill already exists");
    }

    await sql`
      UPDATE users
      SET skills = array_append(COALESCE(skills, '{}'), ${skillName.trim()})
      WHERE user_id = ${userId}
    `;

    await sql`COMMIT`;
    wasSkillAdded = true;
  } catch (error) {
    await sql`ROLLBACK`;
    throw error;
  }

  if (wasSkillAdded) {
    res.status(200).json({
      success: true,
      message: "Skill added successfully",
    });
  }
});



export const deleteSkillFromUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.user_id;
  const { skillName } = req.body;

  if (!skillName || skillName.trim() === "") {
    throw new ErrorHandler(400, "Please provide a skill name");
  }

  try {
    await sql`BEGIN`;

    const users = await sql`
      SELECT user_id, skills FROM users WHERE user_id = ${userId}
    `;

    if (users.length === 0) {
      await sql`ROLLBACK`;
      throw new ErrorHandler(404, "User not found");
    }

    const user = users[0];

    if (!user.skills || user.skills.length === 0) {
      await sql`ROLLBACK`;
      throw new ErrorHandler(404, "User has no skills to delete");
    }

    const skillExists = user.skills
      .map((s:any) => s.toLowerCase())
      .includes(skillName.trim().toLowerCase());

    if (!skillExists) {
      await sql`ROLLBACK`;
      throw new ErrorHandler(404, `Skill "${skillName}" not found`);
    }

    // Find the exact skill name as stored (to handle case differences)
    const exactSkill = user.skills.find(
      (s:any) => s.toLowerCase() === skillName.trim().toLowerCase()
    );

    await sql`
      UPDATE users
      SET skills = array_remove(skills, ${exactSkill})
      WHERE user_id = ${userId}
    `;

    await sql`COMMIT`;
  } catch (error) {
    await sql`ROLLBACK`;
    throw error;
  }

  return res.status(200).json({
    success: true,
    message: "Skill removed successfully",
  });
});