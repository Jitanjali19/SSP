import { Request, Response } from 'express';
import { EligibilityService } from './service';
import { sendSuccess } from '../../common/utils';

const eligibilityService = new EligibilityService();

export class EligibilityController {
  async checkEligibility(req: Request, res: Response) {
    const { patientId } = req.params;
    const result = await eligibilityService.check365DayEligibility(patientId);
    sendSuccess(res, 'Eligibility checked successfully', result);
  }
}