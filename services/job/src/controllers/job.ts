import { AuthenticatedRequest } from "middleware/auth.js";
import { TryCatch } from "../utils/TryCatch.js";
import { sql } from "../utils/db.js"; 
import axios from "axios";
import ErrorHandler from "../utils/errorHandler.js";


export const createCompany = TryCatch(async (req: AuthenticatedRequest, res, next) => {

    const user = req.user;

    if (!user) {
        throw new ErrorHandler(401, 'Unauthorized: Please login to continue.');
    }

    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, 'Forbidden: Only recruiters can create a company!');
    }

    const { name, description, website } = req.body;

    if (!name || !description || !website) {
        throw new ErrorHandler(400, 'Please provide all required fields.');
    }

    if (!req.file) {
        throw new ErrorHandler(400, 'Please upload a company logo.');
    }

    // Check if company name already exists
    const [existing] = await sql`
        SELECT company_id FROM companies WHERE name = ${name}
    `;

    if (existing) {
        throw new ErrorHandler(409, 'A company with this name already exists.');
    }

    // Upload logo via upload service
    const uploadResponse = await axios.post(
        `${process.env.UPLOAD_SERVICE}/api/upload`,
        { buffer: req.file.content }
    );

    const { secure_url: logo, public_id: logo_public_id } = uploadResponse.data;

    if (!logo || !logo_public_id) {
        throw new ErrorHandler(500, 'Failed to upload company logo.');
    }

    const [company] = await sql`
        INSERT INTO companies (
            name,
            description,
            website,
            logo,
            logo_public_id,
            recruiter_id
        )
        VALUES (
            ${name},
            ${description},
            ${website},
            ${logo},
            ${logo_public_id},
            ${user.user_id}
        )
        RETURNING *
    `;

    res.status(201).json({
        success: true,
        message: 'Company created successfully.',
        company,
    });

});


export const updateCompany = TryCatch(async (req: AuthenticatedRequest, res, next) => {

    const user = req.user;

    if (!user) {
        throw new ErrorHandler(401, 'Unauthorized: Please login to continue.');
    }

    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, 'Forbidden: Only recruiters can update a company!');
    }

    const { id } = req.params;

    // Check company exists and belongs to this recruiter
    const [company] = await sql`
        SELECT * FROM companies
        WHERE company_id = ${id}
        AND recruiter_id = ${user.user_id}
    `;

    if (!company) {
        throw new ErrorHandler(404, 'Company not found or you are not authorized to update it.');
    }

    const { name, description, website } = req.body;

    let logo = company.logo;
    let logo_public_id = company.logo_public_id;

    // If a new logo is uploaded, upload it and delete the old one
    if (req.file) {
        const uploadResponse = await axios.post(
            `${process.env.UPLOAD_SERVICE}/api/upload`,
            { buffer: req.file.content }
        );

        if (!uploadResponse.data?.secure_url || !uploadResponse.data?.public_id) {
            throw new ErrorHandler(500, 'Failed to upload new company logo.');
        }

        // Delete old logo from upload service
        await axios.delete(`${process.env.UPLOAD_SERVICE}/api/delete`, {
            data: { public_id: company.logo_public_id }
        });

        logo = uploadResponse.data.secure_url;
        logo_public_id = uploadResponse.data.public_id;
    }

    const [updatedCompany] = await sql`
        UPDATE companies SET
            name         = ${name ?? company.name},
            description  = ${description ?? company.description},
            website      = ${website ?? company.website},
            logo         = ${logo},
            logo_public_id = ${logo_public_id}
        WHERE company_id = ${id}
        AND recruiter_id = ${user.user_id}
        RETURNING *
    `;

    res.status(200).json({
        success: true,
        message: 'Company updated successfully.',
        company: updatedCompany,
    });

});


export const deleteCompany = TryCatch(async (req: AuthenticatedRequest, res, next) => {

    const user = req.user;

    if (!user) {
        throw new ErrorHandler(401, 'Unauthorized: Please login to continue.');
    }

    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, 'Forbidden: Only recruiters can delete a company!');
    }

    const { id } = req.params;

    // Check company exists and belongs to this recruiter
    const [company] = await sql`
        SELECT * FROM companies
        WHERE company_id = ${id}
        AND recruiter_id = ${user.user_id}
    `;

    if (!company) {
        throw new ErrorHandler(404, 'Company not found or you are not authorized to delete it.');
    }

    // Delete logo from upload service
    await axios.delete(`${process.env.UPLOAD_SERVICE}/api/delete`, {
        data: { public_id: company.logo_public_id }
    });

    await sql`
        DELETE FROM companies
        WHERE company_id = ${id}
        AND recruiter_id = ${user.user_id}
    `;

    res.status(200).json({
        success: true,
        message: 'Company deleted successfully.',
    });

});


export const createJob = TryCatch(async (req: AuthenticatedRequest, res, next) => {

    const user = req.user;

    if (!user) {
        throw new ErrorHandler(401, 'Unauthorized: Please login to continue.');
    }

    // ✅ Fix: should throw if user is NOT a recruiter
    if (user.role !== 'recruiter') {
        throw new ErrorHandler(403, 'Forbidden: Only recruiters can create jobs!');
    }

    const {
        title,
        description,
        salary,
        location,
        job_type,
        openings,
        role,
        work_location,
        company_id,
    } = req.body;

    // Validate required fields
    if (!title || !description || !job_type || !openings || !role || !work_location || !company_id) {
        throw new ErrorHandler(400, 'Please provide all required fields.');
    }

    // Ensure the company belongs to this recruiter
    const [company] = await sql`
        SELECT company_id FROM companies
        WHERE company_id = ${company_id}
        AND recruiter_id = ${user.user_id}
    `;

    if (!company) {
        throw new ErrorHandler(404, 'Company not found or you are not authorized to post jobs for this company.');
    }

    // Insert the job
    const [newJob] = await sql`
        INSERT INTO jobs (
            title,
            description,
            salary,
            location,
            job_type,
            openings,
            role,
            work_location,
            company_id,
            posted_by_recruiter_id
        )
        VALUES (
            ${title},
            ${description},
            ${salary ?? null},
            ${location ?? null},
            ${job_type},
            ${openings},
            ${role},
            ${work_location},
            ${company_id},
            ${user.user_id}
        )
        RETURNING *
    `;

    res.status(201).json({
        success: true,
        message: 'Job created successfully.',
        job: newJob,
    });

});