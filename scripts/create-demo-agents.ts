import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { DEMO_AGENTS } from "../demo/agents";

try {
  process.loadEnvFile(".env");
} catch {
  // Fall back to the shell environment.
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Set ELEVENLABS_API_KEY in .env first.");
  process.exit(1);
}

const client = new ElevenLabsClient({ apiKey });

console.log(
  "Creating demo agents. Open them in the ElevenLabs dashboard under Agents to test or pick a voice.",
);
for (const agent of DEMO_AGENTS) {
  const created = await client.conversationalAi.agents.create({
    name: agent.name,
    tags: ["trustline-demo"],
    conversationConfig: {
      agent: {
        firstMessage: agent.firstMessage,
        language: "en",
        prompt: { prompt: agent.prompt },
      },
    },
  });
  console.log(`${agent.name}: ${created.agentId}`);
}
