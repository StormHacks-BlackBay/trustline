// Prefixed with an underscore so Vercel does not deploy this test as a function.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_CALLS } from "../src/data/demoCalls";
import { demoSpeechPath, spokenText } from "../src/lib/demoSpeech";
import { CALLER_VOICES, FALLBACK_VOICE, GET } from "./demo-speech";

const ircc = DEMO_CALLS.find((c) => c.id === "ircc-scam")!;
const request = (path: string) => GET(new Request(`http://local${path}`));
const firstLine = spokenText(ircc, 0);
const validPath = demoSpeechPath(ircc.id, 0, firstLine);

describe("GET /api/demo-speech", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rejects calls and lines that are not in the demo scripts", async () => {
    expect((await request("/api/demo-speech?call=nope&line=0&v=x")).status).toBe(404);
    expect((await request(`/api/demo-speech?call=${ircc.id}&line=99&v=x`)).status).toBe(404);
    expect((await request(`/api/demo-speech?call=${ircc.id}&line=&v=x`)).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a hash that does not match the line", async () => {
    const response = await request(`/api/demo-speech?call=${ircc.id}&line=0&v=wrong`);
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when ElevenLabs is not configured", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    const response = await request(validPath);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "speech_not_configured" });
  });

  it("returns cacheable mp3 audio in the caller's voice", async () => {
    fetchMock.mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), { status: 200 }));
    const response = await request(validPath);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
    expect(response.headers.get("cache-control")).toContain("s-maxage");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toContain(`/text-to-speech/${CALLER_VOICES[ircc.id]}`);
    expect(JSON.parse(String(init?.body))).toMatchObject({ text: firstLine });
    expect(new Headers(init?.headers).get("xi-api-key")).toBe("test-key");
  });

  it("retries with the fallback voice when the caller's voice is unavailable", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response(new Uint8Array([9]), { status: 200 }));
    const response = await request(validPath);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain(`/text-to-speech/${FALLBACK_VOICE}`);
  });

  it("maps a rejected key and rate limits without retrying", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 401 }));
    expect((await request(validPath)).status).toBe(503);

    fetchMock.mockResolvedValueOnce(new Response("", { status: 429 }));
    expect((await request(validPath)).status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache error responses", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const response = await request(validPath);
    expect(response.status).toBe(502);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
