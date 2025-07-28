import crypto from 'crypto';

export function verifySlackRequest(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string
): boolean {
  const time = Math.floor(new Date().getTime() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 60 * 5) {
    return false;
  }

  const sigBasestring = 'v0:' + timestamp + ':' + body;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBasestring, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}