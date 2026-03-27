import { Request, Response } from 'express';
import { SuperAdminService } from './service';
import { CreateAdminRequest, AssignModuleAccessRequest } from './types';
import { sendSuccess } from '../../common/utils';

const superAdminService = new SuperAdminService();

export class SuperAdminController {
  async createAdmin(req: Request, res: Response) {
    const data: CreateAdminRequest = req.body;
    const superAdminId = req.user!.id;
    const result = await superAdminService.createAdmin(data, superAdminId);
    sendSuccess(res, 'Admin created successfully', result, 201);
  }

  async listAdmins(req: Request, res: Response) {
    const admins = await superAdminService.listAdmins();
    sendSuccess(res, 'Admins retrieved successfully', admins);
  }

  async updateAdminStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const result = await superAdminService.updateAdminStatus(id, status);
    sendSuccess(res, 'Admin status updated successfully', result);
  }

  async assignModuleAccess(req: Request, res: Response) {
    const data: AssignModuleAccessRequest = req.body;
    const result = await superAdminService.assignModuleAccess(data);
    sendSuccess(res, 'Module access assigned successfully', result);
  }
}