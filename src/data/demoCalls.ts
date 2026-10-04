export interface DemoCall {
  id: string;
  title: string;
  description: string;
  /** What the caller says. The transcript, detection and sharing all use these exact lines. */
  lines: string[];
  /**
   * Optional acted version of each line for the voice, with Eleven v3 audio tags such as
   * "[stern]" and pauses ("..."). Same words as `lines`, so the transcript matches the audio.
   */
  spoken?: string[];
}

export const DEMO_CALLS: DemoCall[] = [
  {
    id: "ircc-scam",
    title: "IRCC impersonation",
    description: "A caller claims to be from immigration and demands a fine in gift cards.",
    lines: [
      "Hello, this is Officer David Miller calling from Immigration, Refugees and Citizenship Canada.",
      "Our records show you failed to report a change to your immigration status, and there is now a warrant attached to your file.",
      "If this is not resolved today, you will be detained and deported.",
      "To clear the warrant you must pay a fine of two thousand five hundred dollars within the next hour.",
      "Our payment system only accepts Google Play gift cards or bitcoin. Go to the nearest store and buy the cards now.",
      "Do not hang up and do not tell anyone about this call, or your case will be escalated.",
    ],
    spoken: [
      "[clears throat] Hello, this is Officer David Miller calling from Immigration, Refugees and Citizenship Canada.",
      "[serious] Our records show you failed to report a change to your immigration status... [pause] and there is now a warrant attached to your file.",
      "[sternly] If this is not resolved today, you will be detained... and deported.",
      "[impatiently] To clear the warrant you must pay a fine of two thousand five hundred dollars... within the next hour.",
      "Our payment system only accepts Google Play gift cards or bitcoin. [urgently] Go to the nearest store and buy the cards now.",
      "[lowers voice] Do not hang up, and do not tell anyone about this call... [threatening] or your case will be escalated.",
    ],
  },
  {
    id: "bank-alert",
    title: "Real bank fraud alert",
    description: "A credit union checks a card purchase and asks nothing sensitive.",
    lines: [
      "Hi, this is the fraud prevention team at Demo Credit Union calling about your Visa card ending in 4821.",
      "We noticed a purchase of three hundred and twelve dollars at an electronics store in Toronto this morning.",
      "Did you make this purchase? You can simply answer yes or no.",
      "If it wasn't you, we'll block the card and send a new one. We will never ask for your PIN or a verification code.",
      "If you'd prefer, hang up and call us back using the number on the back of your card.",
    ],
    spoken: [
      "[friendly] Hi, this is the fraud prevention team at Demo Credit Union, calling about your Visa card ending in 4821.",
      "We noticed a purchase of three hundred and twelve dollars at an electronics store in Toronto this morning.",
      "[warmly] Did you make this purchase? You can simply answer yes or no.",
      "If it wasn't you, we'll block the card and send a new one. [reassuring] We will never ask for your PIN or a verification code.",
      "[gently] If you'd prefer, hang up and call us back using the number on the back of your card.",
    ],
  },
  {
    id: "bank-ambiguous",
    title: "Unclear bank call",
    description: "A caller says they are from 'your bank' and asks for personal details.",
    lines: [
      "Hello, I'm calling from your bank's security department.",
      "We need to confirm some recent activity on your account before we can release it.",
      "Can you confirm your full date of birth and your social insurance number for me?",
      "Thank you. A specialist will call you back shortly to finish the review.",
    ],
    spoken: [
      "[casually] Hello, I'm calling from your bank's security department.",
      "[hesitates] We need to confirm some recent activity on your account... before we can release it.",
      "Can you confirm your full date of birth... [pause] and your social insurance number for me?",
      "[quickly] Thank you. A specialist will call you back shortly to finish the review.",
    ],
  },
];
