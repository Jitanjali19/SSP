import axios from 'axios';

export class AbhaService {
  private baseUrl = process.env.AXIOS_ABHA_BASE_URL || 'https://mock-abha-api.com';

  async fetchIdentity(abhaId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/identity/${abhaId}`);
      return response.data;
    } catch (error) {
      // Fallback mock data
      return {
        name: 'Mock Name',
        dob: '1990-01-01',
        gender: 'Male',
        address: 'Mock Address',
      };
    }
  }
}