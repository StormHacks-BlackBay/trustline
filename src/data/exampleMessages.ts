export interface ExampleMessage {
  id: string;
  title: string;
  text: string;
}

/** Fictional messages for trying the message check. Domains are made up for the demo. */
export const EXAMPLE_MESSAGES: ExampleMessage[] = [
  {
    id: "cra-refund",
    title: "Tax refund text",
    text: "CRA: You are eligible for a tax refund of $468.50. Claim it within 24 hours at https://cra-refund-portal.com/claim or it will be cancelled.",
  },
  {
    id: "delivery-fee",
    title: "Delivery fee text",
    text: "Canada Post: Your package is on hold because of an unpaid customs fee of $1.99. Pay now at canadapost-redelivery.info to avoid return to sender.",
  },
  {
    id: "new-number",
    title: "'New number' from family",
    text: "Hi Mom, I dropped my phone, this is my new number. Can you send me $800 by e-transfer today? I'll explain later. Please don't tell Dad yet.",
  },
  {
    id: "job-offer",
    title: "Job offer text",
    text: "Maple Staffing: You're hired for the warehouse job at $28/hr! To secure your spot, pay the $1,800 LMIA fee by e-transfer within the next 24 hours. Spots are limited.",
  },
  {
    id: "appointment",
    title: "Appointment reminder",
    text: "Reminder: your appointment at Service Canada is on Tuesday, October 6 at 10:30 a.m. Please bring your passport and proof of address.",
  },
];
