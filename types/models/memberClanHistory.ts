import { z } from "zod";

export const MemberClanHistory = z.object({
  tag: z.string(),
  duration: z.number(),
});

export type MemberClanHistory = z.infer<typeof MemberClanHistory>;
export const MemberClanHistoryArray = z.array(MemberClanHistory);
