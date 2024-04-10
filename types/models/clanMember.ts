import { z } from "zod";

export const ClanMember = z.object({
  tag: z.string(),
  name: z.string(),
});

export type ClanMember = z.infer<typeof ClanMember>;
export const ClanMemberArray = z.array(ClanMember);
