import { expect, it } from "vitest";
import { mulawToWav } from "./simulatorAudio";

it("decodes G.711 silence and signed extremes into playable 8 kHz PCM", () => {
  const wav = mulawToWav(Buffer.from([0xff, 0x7f, 0x00, 0x80]));
  expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
  expect(wav.readUInt32LE(24)).toBe(8000);
  expect(wav.readUInt32LE(40)).toBe(8);
  expect([44, 46, 48, 50].map((offset) => wav.readInt16LE(offset))).toEqual([0, 0, -32124, 32124]);
});
