import type { Response } from "express";

type SendResponseParams<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
};

const sendResponse = <T>(res: Response, payload: SendResponseParams<T>) => {
  const { statusCode, success, message, data, errors } = payload;

  return res.status(statusCode).json({
    success,
    message,
    data,
    errors,
  });
};

export default sendResponse;
