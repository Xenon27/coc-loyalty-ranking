import { z } from "zod";

const returnMemberSchema = z.array(
  z.object({
    playerName: z.string(),
    playerTag: z.string(),
    currentClan: z.string(),
    currentClanTag: z.string(),
    totalDuration: z.number(),
    history: z.array(
      z.object({
        clanName: z.string(),
        clanTag: z.string(),
        duration: z.number(),
      })
    ),
  })
);

export type ReturnMember = z.infer<typeof returnMemberSchema>;
