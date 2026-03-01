module.exports = {
  services: {
    auth: {
      url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
      routes: ['/api/auth']
    },
    patient: {
      url: process.env.PATIENT_SERVICE_URL || 'http://localhost:3002',
      routes: ['/api/patients']
    },
    appointment: {
      url: process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3003',
      routes: ['/api/appointments']
    },
    billing: {
      url: process.env.BILLING_SERVICE_URL || 'http://localhost:3004',
      routes: ['/api/billing']
    }
  }
};