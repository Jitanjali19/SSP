import axios from 'axios';

export class SamagraService {
  private baseUrl = process.env.AXIOS_SAMAGRA_BASE_URL || 'https://mock-samagra-api.com';

  async fetchIdentity(samagraId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/identity/${samagraId}`);
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