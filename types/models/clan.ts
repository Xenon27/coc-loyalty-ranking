import { z } from "zod";

export const Clan = z.object({
  clanName: z.string(),
  clanTag: z.string(),
});

export type Clan = z.infer<typeof Clan>;
export const ClanArray = z.array(Clan);
