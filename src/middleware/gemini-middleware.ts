import { Request, Response, NextFunction } from "express";

export function validateParams(req: Request, res: Response, next: NextFunction){
    const { model, contents } = req.query;
    if ( typeof model !== 'string'|| model.trim()  === '') {
       return res.status(400).json({
        status: "error",
        message: "Invalid or missing parameter: model",
        error: 'Missing or invalid model parameter'
      });
    }

    if (typeof contents !== 'string' || contents.trim().length === 0) {
        return res.status(400).json({ 
           status: "error",
           message: "Invalid or missing parameter: contents",
           error: 'Missing or invalid contents parameter',
        });
    }
    next();
}