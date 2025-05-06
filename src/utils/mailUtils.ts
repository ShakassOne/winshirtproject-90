
// Simulate sending email
export const simulateSendEmail = (email: string, subject: string, body: string): boolean => {
  console.log(`Simulated email to ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  
  return true;
};

export default simulateSendEmail;
