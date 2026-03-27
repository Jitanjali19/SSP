import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const createApiResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string
): ApiResponse<T> => ({
  success,
  message,
  data,
  error,
});

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
) => {
  res.status(statusCode).json(createApiResponse(true, message, data));
};

export const sendError = (
  res: Response,
  message: string,
  error?: string,
  statusCode: number = 400
) => {
  res.status(statusCode).json(createApiResponse(false, message, undefined, error));
};

export const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const maskId = (id: string): string => {
  if (!id || id.length < 4) return '****';
  return id.slice(0, 2) + '****' + id.slice(-2);
};

export const generatePatientReportId = (stateCode: string = 'MP'): string => {
  const randomNum = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${stateCode}-PAT-${randomNum}`;
};

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data);
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

export const generateUUID = (): string => uuidv4();

export const calculateAge = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const isEligibleForCheckup = (lastCheckupDate: Date | null | undefined): boolean => {
  if (!lastCheckupDate) return true;
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return lastCheckupDate < oneYearAgo;
};