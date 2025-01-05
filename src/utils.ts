export const toHexString = (array: Uint8Array): `0x${string}` =>
  `0x${Buffer.from(array).toString("hex")}`;

export function toBytes(hexString: string) {
  // Remove the "0x" prefix if it exists
  if (hexString.startsWith("0x")) {
    hexString = hexString.slice(2);
  }

  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string: length must be even.");
  }

  const array = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    array[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return array;
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
