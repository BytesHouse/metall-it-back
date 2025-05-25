import * as crypto from 'crypto';

export function removeEmpty<T extends { [k: string]: any }>(
  obj: Partial<T>,
): Partial<T> {
  Object.keys(obj).forEach((key) =>
    obj[key] === undefined ? delete obj[key] : {},
  );
  return obj;
}

export function hasProperties<T extends object>(obj: T): boolean {
  return Object.keys(obj).length > 0;
}

export function generatePassword(length: number) {
  const allowedSigns =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$';
  return Array.from(crypto.webcrypto.getRandomValues(new Uint32Array(length)))
    .map((i) => allowedSigns[i % allowedSigns.length])
    .join('');
}

export function generateUserEmail(
  message: string,
  buttonLink: string,
  buttonText: string,
) {
  return `
    <span style="font-size: 14px; weight:500; font-family: 'Roboto'; color: black;">${message}</span>
    <p>
        <a href="${buttonLink}">
            <button style="background-color: #2F8145; color: white; font-size: 16px;
                border: none; font-family: 'Roboto';
                padding: 8px 16px; border-radius: 4px;">${buttonText}</button>
        </a>
    </p>`;
}
