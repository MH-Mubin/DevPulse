import type { NextFunction, Request, Response } from "express";

import AppError from "../errors/AppError";

const globalErrorHandler = (
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			success: false,
			message: error.message,
			errors: error.message,
		});
	}

	const message = error instanceof Error ? error.message : "Something went wrong";

	return res.status(500).json({
		success: false,
		message,
		errors: message,
	});
};

export default globalErrorHandler;
