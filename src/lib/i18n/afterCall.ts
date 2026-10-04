import type { LanguageCode } from "../types";

/**
 * Text message sent after a call where TrustLine gave a warning. {link} is the after-call page.
 * Non-English text was drafted for the hackathon and should be reviewed by native speakers.
 */
export const AFTER_CALL_SMS: Record<LanguageCode, string> = {
  en: "TrustLine: we warned you about a likely scam on your call just now. See what was said and what to do next: {link}",
  pa: "TrustLine: ਅਸੀਂ ਹੁਣੇ ਤੁਹਾਡੀ ਕਾਲ 'ਤੇ ਸੰਭਾਵਿਤ ਠੱਗੀ ਬਾਰੇ ਚੇਤਾਵਨੀ ਦਿੱਤੀ। ਦੇਖੋ ਕੀ ਕਿਹਾ ਗਿਆ ਅਤੇ ਅੱਗੇ ਕੀ ਕਰਨਾ ਹੈ: {link}",
  zh: "TrustLine：刚才我们提醒您这通电话很可能是诈骗。查看通话内容和下一步该怎么做：{link}",
  tl: "TrustLine: binalaan ka namin tungkol sa posibleng scam sa tawag mo kanina. Tingnan ang sinabi at ang susunod na gagawin: {link}",
  fa: "TrustLine: همین حالا دربارهٔ یک کلاهبرداری احتمالی در تماستان به شما هشدار دادیم. ببینید چه گفته شد و قدم بعدی چیست: {link}",
};
