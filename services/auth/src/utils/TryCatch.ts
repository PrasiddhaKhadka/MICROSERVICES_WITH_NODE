import type { Request, Response, NextFunction, RequestHandler } from "express"
import ErrorHandler from "./errorHandler.js"

export const TryCatch = (controller:(req:Request,res:Response,next:NextFunction)=> Promise<any>):RequestHandler=>async(req,res,next)=>{

    try {

        await controller(req,res,next)
        
    } catch (error:any) {
        if(error instanceof ErrorHandler){
            return res.status(error.statusCode || 400).json({
                success:false,
                msg:error.message
            })
        }

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}