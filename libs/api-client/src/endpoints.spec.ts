import { API_ENDPOINTS } from './endpoints';

describe('API_ENDPOINTS', () => {
  it('generates dynamic doctor endpoint URLs', () => {
    expect(API_ENDPOINTS.DOCTORS.BY_ID('doc-123')).toBe('/doctors/doc-123');
    expect(API_ENDPOINTS.DOCTORS.SLOTS('doc-123')).toBe('/doctors/doc-123/slots');
  });

  it('generates dynamic appointment endpoint URLs', () => {
    expect(API_ENDPOINTS.APPOINTMENTS.BY_ID('appt-456')).toBe('/appointments/appt-456');
    expect(API_ENDPOINTS.APPOINTMENTS.CANCEL('appt-456')).toBe(
      '/appointments/appt-456/cancel',
    );
  });
});
