import type { DirectoryEntry, LanguageCode } from "../types";

interface SpokenLines {
  intro: string;
  /** {org} and {phone} come from the verified directory, never from the caller. */
  callOrganization: string;
  callCardNumber: string;
  hangUp: string;
}

/** Short lines TrustLine speaks into the call around the warning itself. */
export const SPOKEN: Record<LanguageCode, SpokenLines> = {
  en: {
    intro: "TrustLine here.",
    callOrganization: "You can hang up and call {org} yourself at {phone}.",
    callCardNumber: "You can hang up and call the number on the back of your card.",
    hangUp: "You can hang up now.",
  },
  pa: {
    intro: "ਟਰੱਸਟਲਾਈਨ ਬੋਲ ਰਿਹਾ ਹੈ।",
    callOrganization: "ਤੁਸੀਂ ਫ਼ੋਨ ਕੱਟ ਕੇ ਖੁਦ {org} ਨੂੰ {phone} 'ਤੇ ਕਾਲ ਕਰ ਸਕਦੇ ਹੋ।",
    callCardNumber: "ਤੁਸੀਂ ਫ਼ੋਨ ਕੱਟ ਕੇ ਆਪਣੇ ਕਾਰਡ ਦੇ ਪਿੱਛੇ ਲਿਖੇ ਨੰਬਰ 'ਤੇ ਕਾਲ ਕਰ ਸਕਦੇ ਹੋ।",
    hangUp: "ਤੁਸੀਂ ਹੁਣ ਫ਼ੋਨ ਕੱਟ ਸਕਦੇ ਹੋ।",
  },
  zh: {
    intro: "这里是 TrustLine。",
    callOrganization: "您可以挂断电话，自己拨打 {phone} 联系 {org}。",
    callCardNumber: "您可以挂断电话，拨打银行卡背面的号码。",
    hangUp: "您现在可以挂断电话。",
  },
  tl: {
    intro: "Ito ang TrustLine.",
    callOrganization: "Puwede mong ibaba ang tawag at tawagan mismo ang {org} sa {phone}.",
    callCardNumber: "Puwede mong ibaba ang tawag at tawagan ang numero sa likod ng card mo.",
    hangUp: "Puwede mo nang ibaba ang tawag.",
  },
  fa: {
    intro: "اینجا تراست‌لاین است.",
    callOrganization: "می‌توانید تلفن را قطع کنید و خودتان با {org} به شماره {phone} تماس بگیرید.",
    callCardNumber: "می‌توانید تلفن را قطع کنید و با شماره پشت کارت بانکی‌تان تماس بگیرید.",
    hangUp: "می‌توانید همین حالا تلفن را قطع کنید.",
  },
};

/** "1-888-242-2100" to "1 888 242 2100", which text to speech reads digit group by group. */
const speakablePhone = (phone: string) => phone.replace(/-/g, " ");

function nextStep(lines: SpokenLines, organization: DirectoryEntry | null): string {
  if (organization?.phone) {
    return lines.callOrganization
      .replace("{org}", organization.shortName)
      .replace("{phone}", speakablePhone(organization.phone));
  }
  if (organization?.category === "bank") return lines.callCardNumber;
  return lines.hangUp;
}

/** The full warning: who is speaking, why the call looks like a scam, and the safe next step. */
export function spokenWarning(
  language: LanguageCode,
  reason: string,
  organization: DirectoryEntry | null,
): string {
  const lines = SPOKEN[language];
  return `${lines.intro} ${reason} ${nextStep(lines, organization)}`;
}
