import type { FlagId, LanguageCode } from "../types";

type ReasonKey = FlagId | "none";

/**
 * Warning text used when only the rules layer has run (no network or LLM unavailable).
 * Non-English text was drafted for the hackathon and should be reviewed by native speakers.
 */
export const REASONS: Record<LanguageCode, Record<ReasonKey, string>> = {
  en: {
    gift_card_payment:
      "They asked for payment in gift cards. Government agencies and banks never accept gift cards.",
    crypto_payment:
      "They asked for payment in cryptocurrency. Government agencies and banks never ask for this.",
    one_time_code:
      "They asked for a verification code or PIN. Your bank will never ask you to read one out.",
    remote_access:
      "They asked to control your phone or computer. Real organizations do not ask for this on a call.",
    wire_transfer:
      "They asked you to move money. Real organizations never ask you to move money to protect it.",
    deportation_threat:
      "They threatened your immigration status. IRCC does not threaten deportation over the phone.",
    arrest_threat:
      "They threatened arrest. Police and government agencies do not take payment to cancel a warrant.",
    personal_info:
      "They asked for personal details. Check who is calling before you share anything.",
    secrecy:
      "They told you to keep this secret or stay on the line. You can always hang up and check.",
    urgency: "They are rushing you. Real organizations give you time to check.",
    suspicious_link:
      "They want you to open a link. Go to the organization's official website yourself instead of using a link you were sent.",
    none: "Nothing in this call matches a known scam tactic so far.",
  },
  pa: {
    gift_card_payment:
      "ਉਹਨਾਂ ਨੇ ਗਿਫਟ ਕਾਰਡਾਂ ਨਾਲ ਭੁਗਤਾਨ ਮੰਗਿਆ। ਸਰਕਾਰੀ ਵਿਭਾਗ ਅਤੇ ਬੈਂਕ ਕਦੇ ਵੀ ਗਿਫਟ ਕਾਰਡ ਨਹੀਂ ਲੈਂਦੇ।",
    crypto_payment:
      "ਉਹਨਾਂ ਨੇ ਕ੍ਰਿਪਟੋਕਰੰਸੀ ਵਿੱਚ ਭੁਗਤਾਨ ਮੰਗਿਆ। ਸਰਕਾਰੀ ਵਿਭਾਗ ਅਤੇ ਬੈਂਕ ਕਦੇ ਵੀ ਇਹ ਨਹੀਂ ਮੰਗਦੇ।",
    one_time_code:
      "ਉਹਨਾਂ ਨੇ ਵੈਰੀਫਿਕੇਸ਼ਨ ਕੋਡ ਜਾਂ PIN ਮੰਗਿਆ। ਤੁਹਾਡਾ ਬੈਂਕ ਕਦੇ ਵੀ ਤੁਹਾਨੂੰ ਇਹ ਪੜ੍ਹ ਕੇ ਸੁਣਾਉਣ ਲਈ ਨਹੀਂ ਕਹੇਗਾ।",
    remote_access:
      "ਉਹਨਾਂ ਨੇ ਤੁਹਾਡੇ ਫ਼ੋਨ ਜਾਂ ਕੰਪਿਊਟਰ ਦਾ ਕੰਟਰੋਲ ਮੰਗਿਆ। ਅਸਲੀ ਸੰਸਥਾਵਾਂ ਕਾਲ 'ਤੇ ਇਹ ਨਹੀਂ ਮੰਗਦੀਆਂ।",
    wire_transfer:
      "ਉਹਨਾਂ ਨੇ ਤੁਹਾਨੂੰ ਪੈਸੇ ਭੇਜਣ ਲਈ ਕਿਹਾ। ਅਸਲੀ ਸੰਸਥਾਵਾਂ ਪੈਸੇ ਸੁਰੱਖਿਅਤ ਕਰਨ ਲਈ ਕਦੇ ਵੀ ਪੈਸੇ ਭੇਜਣ ਲਈ ਨਹੀਂ ਕਹਿੰਦੀਆਂ।",
    deportation_threat:
      "ਉਹਨਾਂ ਨੇ ਤੁਹਾਡੇ ਇਮੀਗ੍ਰੇਸ਼ਨ ਸਟੇਟਸ ਬਾਰੇ ਧਮਕੀ ਦਿੱਤੀ। IRCC ਫ਼ੋਨ 'ਤੇ ਡਿਪੋਰਟ ਕਰਨ ਦੀ ਧਮਕੀ ਨਹੀਂ ਦਿੰਦਾ।",
    arrest_threat:
      "ਉਹਨਾਂ ਨੇ ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੀ ਧਮਕੀ ਦਿੱਤੀ। ਪੁਲਿਸ ਅਤੇ ਸਰਕਾਰੀ ਵਿਭਾਗ ਵਾਰੰਟ ਰੱਦ ਕਰਨ ਲਈ ਪੈਸੇ ਨਹੀਂ ਲੈਂਦੇ।",
    personal_info:
      "ਉਹਨਾਂ ਨੇ ਤੁਹਾਡੀ ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਮੰਗੀ। ਕੁਝ ਵੀ ਦੱਸਣ ਤੋਂ ਪਹਿਲਾਂ ਪਤਾ ਕਰੋ ਕਿ ਕੌਣ ਕਾਲ ਕਰ ਰਿਹਾ ਹੈ।",
    secrecy:
      "ਉਹਨਾਂ ਨੇ ਕਿਹਾ ਕਿ ਇਹ ਗੱਲ ਕਿਸੇ ਨੂੰ ਨਾ ਦੱਸੋ ਜਾਂ ਫ਼ੋਨ ਨਾ ਕੱਟੋ। ਤੁਸੀਂ ਹਮੇਸ਼ਾ ਫ਼ੋਨ ਕੱਟ ਕੇ ਜਾਂਚ ਕਰ ਸਕਦੇ ਹੋ।",
    urgency: "ਉਹ ਤੁਹਾਨੂੰ ਜਲਦਬਾਜ਼ੀ ਕਰਵਾ ਰਹੇ ਹਨ। ਅਸਲੀ ਸੰਸਥਾਵਾਂ ਤੁਹਾਨੂੰ ਜਾਂਚ ਕਰਨ ਦਾ ਸਮਾਂ ਦਿੰਦੀਆਂ ਹਨ।",
    suspicious_link:
      "ਉਹ ਚਾਹੁੰਦੇ ਹਨ ਕਿ ਤੁਸੀਂ ਕੋਈ ਲਿੰਕ ਖੋਲ੍ਹੋ। ਭੇਜੇ ਗਏ ਲਿੰਕ ਦੀ ਬਜਾਏ, ਸੰਸਥਾ ਦੀ ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ 'ਤੇ ਖੁਦ ਜਾਓ।",
    none: "ਹੁਣ ਤੱਕ ਇਸ ਕਾਲ ਵਿੱਚ ਕੋਈ ਜਾਣੀ-ਪਛਾਣੀ ਠੱਗੀ ਵਾਲੀ ਗੱਲ ਨਹੀਂ ਮਿਲੀ।",
  },
  zh: {
    gift_card_payment: "对方要求用礼品卡付款。政府机构和银行从不接受礼品卡付款。",
    crypto_payment: "对方要求用加密货币付款。政府机构和银行从不会这样要求。",
    one_time_code: "对方索要验证码或密码。您的银行绝不会要求您读出验证码。",
    remote_access: "对方要求控制您的手机或电脑。正规机构不会在电话中提出这种要求。",
    wire_transfer: "对方要求您转账。正规机构绝不会以保护资金为由要求您转账。",
    deportation_threat: "对方以您的移民身份相威胁。IRCC 不会在电话中威胁驱逐出境。",
    arrest_threat: "对方威胁要逮捕您。警察和政府机构不会收钱来撤销逮捕令。",
    personal_info: "对方索要您的个人信息。在提供任何信息之前，请先核实来电者身份。",
    secrecy: "对方要求您保密或不要挂断电话。您随时可以挂断电话并自行核实。",
    urgency: "对方在催促您。正规机构会给您时间核实。",
    suspicious_link: "对方希望您打开一个链接。请不要使用收到的链接，而是自己访问该机构的官方网站。",
    none: "到目前为止，这通电话中没有发现已知的诈骗手法。",
  },
  tl: {
    gift_card_payment:
      "Humingi sila ng bayad gamit ang gift card. Hindi kailanman tumatanggap ng gift card ang mga ahensya ng gobyerno at bangko.",
    crypto_payment:
      "Humingi sila ng bayad sa cryptocurrency. Hindi ito kailanman hinihingi ng mga ahensya ng gobyerno at bangko.",
    one_time_code:
      "Hiningi nila ang verification code o PIN mo. Hindi ka kailanman hihilingin ng bangko mo na basahin ito.",
    remote_access:
      "Gusto nilang kontrolin ang telepono o computer mo. Hindi ito hinihingi ng mga totoong organisasyon sa tawag.",
    wire_transfer:
      "Pinapalipat nila ang pera mo. Hindi ka kailanman uutusan ng totoong organisasyon na ilipat ang pera mo para protektahan ito.",
    deportation_threat:
      "Tinakot nila ang immigration status mo. Hindi nananakot ang IRCC ng deportasyon sa telepono.",
    arrest_threat:
      "Tinakot ka nilang aarestuhin. Hindi tumatanggap ng bayad ang pulis o gobyerno para kanselahin ang warrant.",
    personal_info:
      "Hiningi nila ang personal mong impormasyon. Alamin muna kung sino ang tumatawag bago magbigay ng anuman.",
    secrecy:
      "Sinabihan ka nilang ilihim ito o huwag ibaba ang tawag. Puwede mong ibaba ang tawag anumang oras at mag-check.",
    urgency:
      "Minamadali ka nila. Binibigyan ka ng oras ng mga totoong organisasyon para mag-check.",
    suspicious_link:
      "Gusto nilang buksan mo ang isang link. Sa halip na gamitin ang ipinadalang link, pumunta mismo sa opisyal na website ng organisasyon.",
    none: "Wala pang nakitang kilalang taktika ng scam sa tawag na ito.",
  },
  fa: {
    gift_card_payment:
      "آن‌ها خواستند با گیفت کارت پرداخت کنید. سازمان‌های دولتی و بانک‌ها هرگز گیفت کارت قبول نمی‌کنند.",
    crypto_payment:
      "آن‌ها خواستند با ارز دیجیتال پرداخت کنید. سازمان‌های دولتی و بانک‌ها هرگز چنین درخواستی ندارند.",
    one_time_code:
      "آن‌ها کد تأیید یا رمز شما را خواستند. بانک شما هرگز از شما نمی‌خواهد آن را بخوانید.",
    remote_access:
      "آن‌ها خواستند کنترل گوشی یا کامپیوتر شما را بگیرند. سازمان‌های واقعی چنین درخواستی را تلفنی ندارند.",
    wire_transfer:
      "آن‌ها از شما خواستند پول جابه‌جا کنید. سازمان‌های واقعی هرگز برای محافظت از پولتان نمی‌خواهند آن را منتقل کنید.",
    deportation_threat:
      "آن‌ها وضعیت اقامت شما را تهدید کردند. IRCC هرگز تلفنی به اخراج از کشور تهدید نمی‌کند.",
    arrest_threat:
      "آن‌ها شما را به بازداشت تهدید کردند. پلیس و سازمان‌های دولتی برای لغو حکم بازداشت پول نمی‌گیرند.",
    personal_info:
      "آن‌ها اطلاعات شخصی شما را خواستند. قبل از دادن هر اطلاعاتی، مطمئن شوید چه کسی تماس گرفته است.",
    secrecy:
      "آن‌ها گفتند این موضوع را مخفی نگه دارید یا تلفن را قطع نکنید. شما همیشه می‌توانید تلفن را قطع کنید و بررسی کنید.",
    urgency: "آن‌ها شما را عجله می‌دهند. سازمان‌های واقعی به شما فرصت بررسی می‌دهند.",
    suspicious_link:
      "آن‌ها می‌خواهند یک لینک را باز کنید. به جای استفاده از لینکی که برایتان فرستاده شده، خودتان به وب‌سایت رسمی آن سازمان بروید.",
    none: "تا اینجا هیچ ترفند کلاهبرداری شناخته‌شده‌ای در این تماس دیده نشده است.",
  },
};
