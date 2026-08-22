import "dotenv/config";
import { outboxRelayService } from "@/modules/platform";

const INTERVAL_MS = Number(process.env.OUTBOX_RELAY_INTERVAL_MS ?? 2000);
const BATCH_SIZE = Number(process.env.OUTBOX_RELAY_BATCH_SIZE ?? 50);

async function tick() {
  const result = await outboxRelayService.relayBatch(BATCH_SIZE);
  if (result.published > 0 || result.failed > 0) {
    console.info("[outbox-relay]", result);
  }
}

console.info(
  `[outbox-relay] starting — interval=${INTERVAL_MS}ms batch=${BATCH_SIZE}`
);

await tick();
setInterval(() => {
  tick().catch((err) => {
    console.error("[outbox-relay] tick failed", err);
  });
}, INTERVAL_MS);
