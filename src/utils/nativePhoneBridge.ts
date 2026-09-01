/**
 * Autonomous Native Phone & Telephony Bridge for Daisy's Helping Paws
 * Supports Android APK (Capacitor/Cordova) & Mobile Web/PWA Intent schemes.
 */

export interface IVROperation {
  phoneNumber: string;
  ivrSteps?: string[];
  spokenIntro?: string;
  notes?: string;
}

export interface SMSOperation {
  recipient: string;
  message: string;
}

export interface EmailOperation {
  recipient: string;
  subject: string;
  body: string;
}

/**
 * Parses IVR keypad steps into standard DTMF pause sequences (RFC 3601).
 * Each comma `,` represents a 2-second automated dialer pause.
 * Example: phone = "1-877-501-2233", steps = ["Press 1", "Press 3", "Press 0"]
 * Output DTMF: "18775012233,1,,3,,0"
 */
export function buildDtmfDialString(rawPhoneNumber: string, ivrSteps: string[] = []): string {
  const cleanPhone = rawPhoneNumber.replace(/[^0-9+]/g, '');
  
  if (!ivrSteps || ivrSteps.length === 0) {
    return `tel:${cleanPhone}`;
  }

  // Extract leading digits from steps like "Press 1 for English", "Step 2: Press 3"
  const digits: string[] = [];
  for (const step of ivrSteps) {
    const match = step.match(/press\s*([0-9*#])/i) || step.match(/\b([0-9*#])\b/);
    if (match && match[1]) {
      digits.push(match[1]);
    }
  }

  if (digits.length === 0) {
    return `tel:${cleanPhone}`;
  }

  // Use 2 commas (4 second wait) for initial IVR menu greeting, then 1-2 commas between prompts
  const dtmfSequence = `,${digits.join(',,')}`;
  return `tel:${cleanPhone}${dtmfSequence}`;
}

/**
 * Triggers autonomous phone dialer with DTMF IVR sequence
 */
export function triggerAutonomousCall(op: IVROperation): { success: boolean; dialString: string } {
  const dialString = buildDtmfDialString(op.phoneNumber, op.ivrSteps);
  try {
    window.location.href = dialString;
    return { success: true, dialString };
  } catch (err) {
    console.error('Error triggering autonomous phone call:', err);
    return { success: false, dialString };
  }
}

/**
 * Triggers autonomous SMS text dispatch with pre-filled message body
 */
export function triggerAutonomousSms(op: SMSOperation): { success: boolean; smsUri: string } {
  const cleanRecipient = op.recipient.replace(/[^0-9+]/g, '') || '211';
  // Standard Android & iOS SMS intent URI
  const smsUri = `sms:${cleanRecipient}?body=${encodeURIComponent(op.message)}`;
  
  try {
    window.location.href = smsUri;
    return { success: true, smsUri };
  } catch (err) {
    console.error('Error triggering autonomous SMS:', err);
    return { success: false, smsUri };
  }
}

/**
 * Triggers autonomous email dispatch via native mail client
 */
export function triggerAutonomousEmail(op: EmailOperation): { success: boolean; mailtoUri: string } {
  const mailtoUri = `mailto:${op.recipient}?subject=${encodeURIComponent(op.subject)}&body=${encodeURIComponent(op.body)}`;
  try {
    window.location.href = mailtoUri;
    return { success: true, mailtoUri };
  } catch (err) {
    console.error('Error triggering autonomous Email:', err);
    return { success: false, mailtoUri };
  }
}

/**
 * Shares application or packet using native Android/Web Share API
 */
export async function sharePacketNatively(title: string, text: string, url?: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: url || window.location.href,
      });
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Native share failed, falling back to clipboard:', err);
      }
    }
  }
  
  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${title}\n\n${text}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the app is currently running inside an Android WebView / Capacitor APK
 */
export function isNativeAndroidApp(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || '';
  const isCapacitor = (window as any).Capacitor?.isNativePlatform();
  const isAndroid = /android/i.test(userAgent);
  return Boolean(isCapacitor || (isAndroid && /wv|Version\/[0-9.]+/i.test(userAgent)));
}
