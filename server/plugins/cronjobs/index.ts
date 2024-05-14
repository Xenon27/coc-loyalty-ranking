import { useScheduler } from "#scheduler";
import refreshFruchtLaborCache from "./refreshFruchtLaborCache";

export default defineNitroPlugin(() => {
  startScheduler();
});

function startScheduler() {
  const scheduler = useScheduler();

  scheduler
    .run(() => {
      refreshFruchtLaborCache();
    })
    .dailyAt(4, 0);
}
