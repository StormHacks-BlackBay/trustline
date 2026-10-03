import type { LanguageCode } from "../types";

/** Short lines TrustLine speaks into the call around the warning itself. */
export const SPOKEN: Record<LanguageCode, { intro: string; hangUp: string }> = {
  en: {
    intro: "TrustLine here.",
    hangUp: "You can hang up now. TrustLine has sent the official number to your phone.",
  },
  pa: {
    intro: "ਟਰੱਸਟਲਾਈਨ ਬੋਲ ਰਿਹਾ ਹੈ।",
    hangUp: "ਤੁਸੀਂ ਹੁਣ ਫ਼ੋਨ ਕੱਟ ਸਕਦੇ ਹੋ। ਟਰੱਸਟਲਾਈਨ ਨੇ ਅਧਿਕਾਰਤ ਨੰਬਰ ਤੁਹਾਡੇ ਫ਼ੋਨ 'ਤੇ ਭੇਜ ਦਿੱਤਾ ਹੈ।",
  },
  zh: {
    intro: "这里是 TrustLine。",
    hangUp: "您现在可以挂断电话。TrustLine 已将官方电话号码发送到您的手机。",
  },
  tl: {
    intro: "Ito ang TrustLine.",
    hangUp:
      "Puwede mo nang ibaba ang tawag. Ipinadala ng TrustLine sa telepono mo ang opisyal na numero.",
  },
  fa: {
    intro: "اینجا تراست‌لاین است.",
    hangUp:
      "می‌توانید همین حالا تلفن را قطع کنید. تراست‌لاین شماره رسمی را به گوشی شما فرستاده است.",
  },
};

export function spokenWarning(language: LanguageCode, reason: string): string {
  const lines = SPOKEN[language];
  return `${lines.intro} ${reason} ${lines.hangUp}`;
}
