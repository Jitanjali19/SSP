import { Request, Response } from 'express';
import { UserService } from './service';
import { sendSuccess } from '../../common/utils';
import { CreateUserRequest, UpdateUserRequest } from './types';

const userService = new UserService();

export class UsersController {
  async createUser(req: Request, res: Response) {
    const payload: CreateUserRequest = req.body;
    const user = await userService.createUser(payload);
    sendSuccess(res, 'User created successfully', user, 201);
  }

  async getAllUsers(req: Request, res: Response) {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);
    const { users, pagination } = await userService.getAllUsers(page, limit);
    sendSuccess(res, 'Users retrieved successfully', { users, pagination }, 200);
  }

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    sendSuccess(res, 'User retrieved successfully', user);
  }

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const payload: UpdateUserRequest = req.body;
    const user = await userService.updateUser(id, payload);
    sendSuccess(res, 'User updated successfully', user);
  }

  async softDeleteUser(req: Request, res: Response) {
    const { id } = req.params;
    const user = await userService.softDeleteUser(id);
    sendSuccess(res, 'User soft-deleted successfully', user);
  }

  async changeUserStatus(req: Request, res: Response) {
    const { id } = req.params;
    const user = await userService.changeUserStatus(id, req.body);
    sendSuccess(res, 'User status updated successfully', user);
  }

  async approveVendor(req: Request, res: Response) {
    const { vendorId } = req.params;
    const adminId = req.user!.id;
    const result = await userService.approveVendor(vendorId, adminId);
    sendSuccess(res, 'Vendor approved successfully', result);
  }

  async rejectVendor(req: Request, res: Response) {
    const { vendorId } = req.params;
    const adminId = req.user!.id;
    const { reason } = req.body;
    const result = await userService.rejectVendor(vendorId, adminId, reason);
    sendSuccess(res, 'Vendor rejected successfully', result);
  }

  async getPendingVendors(req: Request, res: Response) {
    const result = await userService.getPendingVendors();
    sendSuccess(res, 'Pending vendors retrieved successfully', result);
  }
}
