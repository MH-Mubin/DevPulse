import type { Request, Response } from "express";

const notFound = (req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
		errors: `${req.method} ${req.originalUrl}`,
	});
};

export default notFound;
