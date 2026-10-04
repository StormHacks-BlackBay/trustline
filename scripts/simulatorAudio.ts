import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Speaker } from "../server/speaker";

export function mulawToWav(audio: Buffer): Buffer {
  const wav = Buffer.alloc(44 + audio.length * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(8000, 24);
  wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(audio.length * 2, 40);
  audio.forEach((byte, i) => {
    const value = ~byte & 0xff;
    const magnitude = (((value & 15) << 3) + 132) << ((value >> 4) & 7);
    wav.writeInt16LE(value & 128 ? 132 - magnitude : magnitude - 132, 44 + i * 2);
  });
  return wav;
}

export function simulatorAudio(speaker: Speaker) {
  let playback = Promise.resolve();
  return {
    speaker: {
      async synthesize(text, language) {
        const dir = resolve("demo/recordings");
        await mkdir(dir, { recursive: true });
        const hash = createHash("sha256")
          .update(
            JSON.stringify([
              text,
              language,
              process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb",
              process.env.ELEVENLABS_TTS_MODEL || "eleven_v3",
            ]),
          )
          .digest("hex");
        const path = resolve(dir, `warning-${hash}.wav`);
        let audio: Buffer;
        try {
          const wav = await readFile(path);
          // The original mu-law bytes are cached separately to preserve the phone audio exactly.
          audio = await readFile(`${path}.ulaw`);
          if (wav.length !== 44 + audio.length * 2) throw new Error("Invalid cached audio");
        } catch {
          audio = await speaker.synthesize(text, language);
          await writeFile(path, mulawToWav(audio));
          await writeFile(`${path}.ulaw`, audio);
        }
        console.log(`Warning audio saved: ${path}`);
        if (process.platform === "darwin" && process.env.SIMULATOR_PLAY_AUDIO !== "0") {
          playback = playback.then(
            () =>
              new Promise<void>((resolve) => {
                const child = spawn("afplay", [path], { stdio: "ignore" });
                child.once("error", () => {
                  console.warn("Could not play warning; open the saved WAV.");
                  resolve();
                });
                child.once("exit", () => resolve());
              }),
          );
        }
        return audio;
      },
    } satisfies Speaker,
    finished: () => playback,
  };
}
