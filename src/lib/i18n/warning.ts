import type { FlagId, LanguageCode, RiskLevel } from "../types";

/**
 * Everything shown in the warning and the share flow, in the listener's language. {org}, {phone}
 * and {partner} are filled in by the UI; organization names and numbers come from the directory.
 * Non-English text was drafted for the hackathon and should be reviewed by native speakers.
 */
const en = {
  callCheck: "Call check",
  messageCheck: "Message check",
  warningSigns: "Warning signs",
  checkingCall: "Checking the rest of the call…",
  checkingMessage: "Checking the message…",
  basicMode: "Basic mode: warnings come from on-device rules only.",
  lowCall: "TrustLine keeps checking as the call goes on.",
  lowMessage:
    "Nothing in this message matches a known scam tactic. If you are unsure, contact the organization through its official website.",
  callOrganization: "Hang up and call {org} at {phone}",
  callCardNumber: "Hang up and call the number on the back of your card.",
  hangUpAnyTime: "You can hang up at any time.",
  messageOrganization: "Don't reply. Call {org} at {phone}",
  messageCardNumber: "Don't reply or tap any links. Call the number on the back of your card.",
  messageNoLinks: "Don't reply or tap any links in this message.",
  recovery: "Already paid or shared details? See what to do now",
  shareButton: "Share with {partner}",
  shareTitle: "Share with {partner}?",
  shareBody:
    "This helps {partner} warn other people about this scam. Only the details below are sent. Names, phone numbers, emails and account numbers are removed.",
  callerClaimed: "Caller claimed to be",
  senderClaimed: "Sender claimed to be",
  notStated: "Not stated",
  none: "None",
  callerSaid: "What the caller said (redacted)",
  messageRedacted: "The message (redacted)",
  excerptLabel: "Redacted excerpt",
  shareFailed: "Could not share right now. Check your connection and try again.",
  share: "Share",
  sharing: "Sharing…",
  dontShare: "Don't share",
  shared: "Shared with {partner}. Thank you, this helps warn others.",
};

export type WarningKey = keyof typeof en;
type WarningText = Record<WarningKey, string>;

export const WARNING_TEXT: Record<LanguageCode, WarningText> = {
  en,
  pa: {
    callCheck: "ਕਾਲ ਜਾਂਚ",
    messageCheck: "ਸੁਨੇਹਾ ਜਾਂਚ",
    warningSigns: "ਚੇਤਾਵਨੀ ਸੰਕੇਤ",
    checkingCall: "ਬਾਕੀ ਕਾਲ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ…",
    checkingMessage: "ਸੁਨੇਹੇ ਦੀ ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ…",
    basicMode: "ਬੇਸਿਕ ਮੋਡ: ਚੇਤਾਵਨੀਆਂ ਸਿਰਫ਼ ਡਿਵਾਈਸ ਦੇ ਨਿਯਮਾਂ ਤੋਂ ਆਉਂਦੀਆਂ ਹਨ।",
    lowCall: "ਕਾਲ ਚੱਲਦੇ ਸਮੇਂ TrustLine ਜਾਂਚ ਕਰਦਾ ਰਹਿੰਦਾ ਹੈ।",
    lowMessage:
      "ਇਸ ਸੁਨੇਹੇ ਵਿੱਚ ਕੋਈ ਜਾਣੀ-ਪਛਾਣੀ ਠੱਗੀ ਵਾਲੀ ਗੱਲ ਨਹੀਂ ਮਿਲੀ। ਜੇ ਤੁਹਾਨੂੰ ਯਕੀਨ ਨਹੀਂ, ਤਾਂ ਸੰਸਥਾ ਨਾਲ ਉਸਦੀ ਅਧਿਕਾਰਤ ਵੈੱਬਸਾਈਟ ਰਾਹੀਂ ਸੰਪਰਕ ਕਰੋ।",
    callOrganization: "ਫ਼ੋਨ ਕੱਟੋ ਅਤੇ {org} ਨੂੰ {phone} 'ਤੇ ਕਾਲ ਕਰੋ",
    callCardNumber: "ਫ਼ੋਨ ਕੱਟੋ ਅਤੇ ਆਪਣੇ ਕਾਰਡ ਦੇ ਪਿੱਛੇ ਲਿਖੇ ਨੰਬਰ 'ਤੇ ਕਾਲ ਕਰੋ।",
    hangUpAnyTime: "ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਫ਼ੋਨ ਕੱਟ ਸਕਦੇ ਹੋ।",
    messageOrganization: "ਜਵਾਬ ਨਾ ਦਿਓ। {org} ਨੂੰ {phone} 'ਤੇ ਕਾਲ ਕਰੋ",
    messageCardNumber:
      "ਜਵਾਬ ਨਾ ਦਿਓ ਅਤੇ ਕਿਸੇ ਲਿੰਕ 'ਤੇ ਟੈਪ ਨਾ ਕਰੋ। ਆਪਣੇ ਕਾਰਡ ਦੇ ਪਿੱਛੇ ਲਿਖੇ ਨੰਬਰ 'ਤੇ ਕਾਲ ਕਰੋ।",
    messageNoLinks: "ਇਸ ਸੁਨੇਹੇ ਦਾ ਜਵਾਬ ਨਾ ਦਿਓ ਅਤੇ ਇਸ ਵਿਚਲੇ ਕਿਸੇ ਲਿੰਕ 'ਤੇ ਟੈਪ ਨਾ ਕਰੋ।",
    recovery: "ਪਹਿਲਾਂ ਹੀ ਪੈਸੇ ਦੇ ਦਿੱਤੇ ਜਾਂ ਜਾਣਕਾਰੀ ਦੱਸ ਦਿੱਤੀ? ਦੇਖੋ ਹੁਣ ਕੀ ਕਰਨਾ ਹੈ",
    shareButton: "{partner} ਨਾਲ ਸਾਂਝਾ ਕਰੋ",
    shareTitle: "ਕੀ {partner} ਨਾਲ ਸਾਂਝਾ ਕਰਨਾ ਹੈ?",
    shareBody:
      "ਇਸ ਨਾਲ {partner} ਹੋਰ ਲੋਕਾਂ ਨੂੰ ਇਸ ਠੱਗੀ ਬਾਰੇ ਚੇਤਾਵਨੀ ਦੇ ਸਕਦਾ ਹੈ। ਸਿਰਫ਼ ਹੇਠਾਂ ਦਿੱਤੀ ਜਾਣਕਾਰੀ ਭੇਜੀ ਜਾਂਦੀ ਹੈ। ਨਾਮ, ਫ਼ੋਨ ਨੰਬਰ, ਈਮੇਲ ਅਤੇ ਖਾਤਾ ਨੰਬਰ ਹਟਾ ਦਿੱਤੇ ਜਾਂਦੇ ਹਨ।",
    callerClaimed: "ਕਾਲ ਕਰਨ ਵਾਲੇ ਨੇ ਦਾਅਵਾ ਕੀਤਾ ਕਿ ਉਹ ਇੱਥੋਂ ਹੈ",
    senderClaimed: "ਭੇਜਣ ਵਾਲੇ ਨੇ ਦਾਅਵਾ ਕੀਤਾ ਕਿ ਉਹ ਇੱਥੋਂ ਹੈ",
    notStated: "ਨਹੀਂ ਦੱਸਿਆ",
    none: "ਕੋਈ ਨਹੀਂ",
    callerSaid: "ਕਾਲ ਕਰਨ ਵਾਲੇ ਨੇ ਕੀ ਕਿਹਾ (ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਹਟਾਈ ਗਈ)",
    messageRedacted: "ਸੁਨੇਹਾ (ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਹਟਾਈ ਗਈ)",
    excerptLabel: "ਨਿੱਜੀ ਜਾਣਕਾਰੀ ਹਟਾਇਆ ਅੰਸ਼",
    shareFailed: "ਹੁਣੇ ਸਾਂਝਾ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਆਪਣਾ ਕਨੈਕਸ਼ਨ ਜਾਂਚੋ ਅਤੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
    share: "ਸਾਂਝਾ ਕਰੋ",
    sharing: "ਸਾਂਝਾ ਹੋ ਰਿਹਾ ਹੈ…",
    dontShare: "ਸਾਂਝਾ ਨਾ ਕਰੋ",
    shared: "{partner} ਨਾਲ ਸਾਂਝਾ ਕੀਤਾ ਗਿਆ। ਧੰਨਵਾਦ, ਇਸ ਨਾਲ ਹੋਰਾਂ ਨੂੰ ਚੇਤਾਵਨੀ ਦੇਣ ਵਿੱਚ ਮਦਦ ਮਿਲਦੀ ਹੈ।",
  },
  zh: {
    callCheck: "通话检查",
    messageCheck: "信息检查",
    warningSigns: "警示信号",
    checkingCall: "正在检查通话的其余部分…",
    checkingMessage: "正在检查信息…",
    basicMode: "基础模式：警告仅来自设备上的规则。",
    lowCall: "通话过程中，TrustLine 会持续检查。",
    lowMessage: "这条信息中没有发现已知的诈骗手法。如果不确定，请通过该机构的官方网站联系对方。",
    callOrganization: "挂断电话，拨打 {phone} 联系 {org}",
    callCardNumber: "挂断电话，拨打银行卡背面的号码。",
    hangUpAnyTime: "您可以随时挂断电话。",
    messageOrganization: "不要回复。拨打 {phone} 联系 {org}",
    messageCardNumber: "不要回复，也不要点击任何链接。请拨打银行卡背面的号码。",
    messageNoLinks: "不要回复这条信息，也不要点击其中的任何链接。",
    recovery: "已经付款或透露了个人信息？查看现在该怎么做",
    shareButton: "分享给 {partner}",
    shareTitle: "要分享给 {partner} 吗？",
    shareBody:
      "这能帮助 {partner} 提醒其他人注意这种诈骗。只会发送以下内容。姓名、电话号码、电子邮件和账号都会被删除。",
    callerClaimed: "来电者自称来自",
    senderClaimed: "发送者自称来自",
    notStated: "未说明",
    none: "无",
    callerSaid: "来电者说的话（已删除个人信息）",
    messageRedacted: "信息内容（已删除个人信息）",
    excerptLabel: "已删除个人信息的摘录",
    shareFailed: "暂时无法分享。请检查网络连接后重试。",
    share: "分享",
    sharing: "正在分享…",
    dontShare: "不分享",
    shared: "已分享给 {partner}。谢谢，这有助于提醒其他人。",
  },
  tl: {
    callCheck: "Pagsusuri ng tawag",
    messageCheck: "Pagsusuri ng mensahe",
    warningSigns: "Mga palatandaan ng babala",
    checkingCall: "Sinusuri pa ang natitirang bahagi ng tawag…",
    checkingMessage: "Sinusuri ang mensahe…",
    basicMode: "Basic mode: ang mga babala ay galing lang sa mga panuntunan sa device.",
    lowCall: "Patuloy na nagsusuri ang TrustLine habang tumatagal ang tawag.",
    lowMessage:
      "Walang bahagi ng mensaheng ito na tumutugma sa kilalang taktika ng scam. Kung hindi ka sigurado, makipag-ugnayan sa organisasyon sa pamamagitan ng opisyal nitong website.",
    callOrganization: "Ibaba ang tawag at tawagan ang {org} sa {phone}",
    callCardNumber: "Ibaba ang tawag at tawagan ang numero sa likod ng iyong card.",
    hangUpAnyTime: "Puwede mong ibaba ang tawag anumang oras.",
    messageOrganization: "Huwag sumagot. Tawagan ang {org} sa {phone}",
    messageCardNumber:
      "Huwag sumagot o pumindot ng anumang link. Tawagan ang numero sa likod ng iyong card.",
    messageNoLinks: "Huwag sagutin ang mensaheng ito o pindutin ang anumang link dito.",
    recovery: "Nakapagbayad na o nakapagbigay na ng impormasyon? Tingnan ang dapat gawin ngayon",
    shareButton: "Ibahagi sa {partner}",
    shareTitle: "Ibahagi sa {partner}?",
    shareBody:
      "Makakatulong ito sa {partner} na balaan ang ibang tao tungkol sa scam na ito. Ang mga detalye lang sa ibaba ang ipapadala. Tinatanggal ang mga pangalan, numero ng telepono, email at numero ng account.",
    callerClaimed: "Sinabi ng tumawag na siya ay mula sa",
    senderClaimed: "Sinabi ng nagpadala na siya ay mula sa",
    notStated: "Hindi binanggit",
    none: "Wala",
    callerSaid: "Ang sinabi ng tumawag (tinanggal ang personal na impormasyon)",
    messageRedacted: "Ang mensahe (tinanggal ang personal na impormasyon)",
    excerptLabel: "Sipi na tinanggalan ng personal na impormasyon",
    shareFailed: "Hindi maibahagi ngayon. Suriin ang iyong koneksyon at subukan muli.",
    share: "Ibahagi",
    sharing: "Ibinabahagi…",
    dontShare: "Huwag ibahagi",
    shared: "Naibahagi sa {partner}. Salamat, nakakatulong ito na mabalaan ang iba.",
  },
  fa: {
    callCheck: "بررسی تماس",
    messageCheck: "بررسی پیام",
    warningSigns: "نشانه‌های هشدار",
    checkingCall: "در حال بررسی بقیهٔ تماس…",
    checkingMessage: "در حال بررسی پیام…",
    basicMode: "حالت پایه: هشدارها فقط از قوانین روی دستگاه می‌آیند.",
    lowCall: "TrustLine در طول تماس به بررسی ادامه می‌دهد.",
    lowMessage:
      "هیچ چیز در این پیام با ترفندهای شناخته‌شدهٔ کلاهبرداری مطابقت ندارد. اگر مطمئن نیستید، از طریق وب‌سایت رسمی با آن سازمان تماس بگیرید.",
    callOrganization: "تماس را قطع کنید و با {org} به شمارهٔ {phone} تماس بگیرید",
    callCardNumber: "تماس را قطع کنید و با شمارهٔ پشت کارتتان تماس بگیرید.",
    hangUpAnyTime: "هر زمان که بخواهید می‌توانید تماس را قطع کنید.",
    messageOrganization: "پاسخ ندهید. با {org} به شمارهٔ {phone} تماس بگیرید",
    messageCardNumber: "پاسخ ندهید و روی هیچ لینکی نزنید. با شمارهٔ پشت کارتتان تماس بگیرید.",
    messageNoLinks: "به این پیام پاسخ ندهید و روی هیچ لینکی در آن نزنید.",
    recovery: "قبلاً پول پرداخت کرده‌اید یا اطلاعات داده‌اید؟ ببینید اکنون چه باید بکنید",
    shareButton: "اشتراک‌گذاری با {partner}",
    shareTitle: "با {partner} به اشتراک گذاشته شود؟",
    shareBody:
      "این کار به {partner} کمک می‌کند دیگران را دربارهٔ این کلاهبرداری آگاه کند. فقط جزئیات زیر ارسال می‌شود. نام‌ها، شماره‌های تلفن، ایمیل‌ها و شماره‌های حساب حذف می‌شوند.",
    callerClaimed: "تماس‌گیرنده ادعا کرد از طرف",
    senderClaimed: "فرستنده ادعا کرد از طرف",
    notStated: "گفته نشد",
    none: "هیچ",
    callerSaid: "آنچه تماس‌گیرنده گفت (اطلاعات شخصی حذف شده)",
    messageRedacted: "پیام (اطلاعات شخصی حذف شده)",
    excerptLabel: "گزیدهٔ بدون اطلاعات شخصی",
    shareFailed: "اکنون امکان اشتراک‌گذاری نیست. اتصال خود را بررسی کنید و دوباره تلاش کنید.",
    share: "اشتراک‌گذاری",
    sharing: "در حال اشتراک‌گذاری…",
    dontShare: "اشتراک‌گذاری نکن",
    shared: "با {partner} به اشتراک گذاشته شد. سپاس، این به آگاه کردن دیگران کمک می‌کند.",
  },
};

export const RISK_LABELS: Record<LanguageCode, Record<RiskLevel, string>> = {
  en: { low: "No warning signs", medium: "Could not confirm", high: "Likely scam" },
  pa: { low: "ਕੋਈ ਚੇਤਾਵਨੀ ਸੰਕੇਤ ਨਹੀਂ", medium: "ਪੁਸ਼ਟੀ ਨਹੀਂ ਹੋ ਸਕੀ", high: "ਸੰਭਾਵਿਤ ਠੱਗੀ" },
  zh: { low: "未发现警示信号", medium: "无法确认", high: "很可能是诈骗" },
  tl: { low: "Walang palatandaan ng babala", medium: "Hindi makumpirma", high: "Malamang na scam" },
  fa: { low: "نشانهٔ هشداری نیست", medium: "قابل تأیید نیست", high: "احتمالاً کلاهبرداری" },
};

export const FLAG_LABELS_BY_LANGUAGE: Record<LanguageCode, Record<FlagId, string>> = {
  en: {
    gift_card_payment: "Gift card payment",
    crypto_payment: "Crypto payment",
    wire_transfer: "Money transfer",
    upfront_fee: "Fee for a job or permit",
    one_time_code: "Code or PIN request",
    personal_info: "Personal details",
    remote_access: "Device access",
    suspicious_link: "Suspicious link",
    secrecy: "Secrecy",
    urgency: "Pressure to act now",
    arrest_threat: "Arrest threat",
    deportation_threat: "Immigration threat",
  },
  pa: {
    gift_card_payment: "ਗਿਫਟ ਕਾਰਡ ਨਾਲ ਭੁਗਤਾਨ",
    crypto_payment: "ਕ੍ਰਿਪਟੋ ਭੁਗਤਾਨ",
    wire_transfer: "ਪੈਸੇ ਭੇਜਣਾ",
    upfront_fee: "ਨੌਕਰੀ ਜਾਂ ਪਰਮਿਟ ਲਈ ਫੀਸ",
    one_time_code: "ਕੋਡ ਜਾਂ PIN ਦੀ ਮੰਗ",
    personal_info: "ਨਿੱਜੀ ਜਾਣਕਾਰੀ",
    remote_access: "ਡਿਵਾਈਸ ਦੀ ਪਹੁੰਚ",
    suspicious_link: "ਸ਼ੱਕੀ ਲਿੰਕ",
    secrecy: "ਗੁਪਤ ਰੱਖਣ ਲਈ ਕਹਿਣਾ",
    urgency: "ਤੁਰੰਤ ਕਾਰਵਾਈ ਦਾ ਦਬਾਅ",
    arrest_threat: "ਗ੍ਰਿਫ਼ਤਾਰੀ ਦੀ ਧਮਕੀ",
    deportation_threat: "ਇਮੀਗ੍ਰੇਸ਼ਨ ਦੀ ਧਮਕੀ",
  },
  zh: {
    gift_card_payment: "礼品卡付款",
    crypto_payment: "加密货币付款",
    wire_transfer: "转账",
    upfront_fee: "工作或许可收费",
    one_time_code: "索要验证码或密码",
    personal_info: "个人信息",
    remote_access: "设备控制",
    suspicious_link: "可疑链接",
    secrecy: "要求保密",
    urgency: "催促立即行动",
    arrest_threat: "逮捕威胁",
    deportation_threat: "移民身份威胁",
  },
  tl: {
    gift_card_payment: "Bayad gamit ang gift card",
    crypto_payment: "Bayad gamit ang crypto",
    wire_transfer: "Paglilipat ng pera",
    upfront_fee: "Bayad para sa trabaho o permit",
    one_time_code: "Paghingi ng code o PIN",
    personal_info: "Personal na detalye",
    remote_access: "Pag-access sa device",
    suspicious_link: "Kahina-hinalang link",
    secrecy: "Paglilihim",
    urgency: "Pagmamadali",
    arrest_threat: "Banta ng pag-aresto",
    deportation_threat: "Banta sa imigrasyon",
  },
  fa: {
    gift_card_payment: "پرداخت با کارت هدیه",
    crypto_payment: "پرداخت با رمزارز",
    wire_transfer: "انتقال پول",
    upfront_fee: "هزینه برای کار یا مجوز",
    one_time_code: "درخواست کد یا رمز",
    personal_info: "اطلاعات شخصی",
    remote_access: "دسترسی به دستگاه",
    suspicious_link: "لینک مشکوک",
    secrecy: "پنهان‌کاری",
    urgency: "فشار برای اقدام فوری",
    arrest_threat: "تهدید به بازداشت",
    deportation_threat: "تهدید مهاجرتی",
  },
};

/** Fills {name} placeholders in a translated string. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}

/** Splits a translated string around its placeholders, so the UI can style a value (a phone). */
export function templateParts(template: string): { text: string; placeholder: boolean }[] {
  return template
    .split(/(\{\w+\})/)
    .filter((part) => part.length > 0)
    .map((part) => {
      const placeholder = /^\{\w+\}$/.test(part);
      return { text: placeholder ? part.slice(1, -1) : part, placeholder };
    });
}

export function warningText(language: LanguageCode): Record<WarningKey, string> {
  return WARNING_TEXT[language];
}
