import { environment } from '../../environments/environment';
import { API_BASE_URL } from './api.config';

describe('API configuration', () => {
  it('uses the configured environment API base URL', () => {
    expect(API_BASE_URL).toBe(environment.apiBaseUrl);
  });
});
