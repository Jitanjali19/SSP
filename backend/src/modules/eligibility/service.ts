import prisma from '../../config/database';
import { isEligibleForCheckup } from '../../common/utils';

export class EligibilityService {
  async check365DayEligibility(patientId: string) {
    const lastVisit = await prisma.patientCampVisit.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: { report: true },
    });

    const lastCheckupDate = lastVisit?.report?.submittedAt ?? lastVisit?.createdAt;
    const eligible = isEligibleForCheckup(lastCheckupDate ?? null);
    const nextDueDate = lastCheckupDate ? new Date(lastCheckupDate.getTime() + 365 * 24 * 60 * 60 * 1000) : new Date();

    return {
      eligible,
      reason: eligible ? null : 'Patient has visited within the last 365 days',
      nextDueDate,
      lastCheckupDate,
    };
  }
}