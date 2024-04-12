import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import { Clan, ClanArray } from "~/types/models/clan";
import { ClanMemberArray } from "~/types/models/clanMember";
import { MemberClanHistoryArray } from "~/types/models/memberClanHistory";

dotenv.config();
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.COC_API_TOKEN}`;

// TODO: outsource map function to a separate function

export default defineEventHandler(async (event) => {
  const family = getRouterParam(event, "family");
  if (!family) {
    throw createError({
      statusCode: 400,
      statusMessage: "Family not found.",
    });
  }

  const dataResponse = await useStorage("data").getItem(family);
  if (!dataResponse) {
    throw createError({
      statusCode: 500,
      statusMessage: "DataResponse not found.",
    });
  }
  const parseData = ClanArray.safeParse(dataResponse);

  if (!parseData.success) {
    console.log(parseData.error);
    throw createError({
      statusCode: 500,
      statusMessage: "DataResponse could not be parsed.",
    });
  }

  return await getFamilyMembersDurations(parseData.data);
});

async function getFamilyMembersDurations(listOfFamilyClans: Clan[]) {
  const familyMembers: any = [];

  await Promise.all(
    listOfFamilyClans.map(async (clan) => {
      const members = await getClanMembers(clan.clanTag);

      members.forEach((member) => {
        familyMembers.push({
          playerName: member.name,
          playerTag: member.tag,
          currentClan: clan.clanName,
          currentClanTag: clan.clanTag,
          totalDuration: 0,
          history: [],
        });
      });
    })
  );
  for (const member of familyMembers) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    member.history = member.history.concat(
      await getPlayerHistory(member.playerTag, listOfFamilyClans)
    );
  }
  await Promise.all(
    familyMembers.map(async (member: any) => {
      member.totalDuration = member.history.reduce(
        (totalDuration: number, clan: any) => totalDuration + clan.duration,
        0
      );
    })
  );

  return familyMembers;
}

async function getClanMembers(clanTag: string) {
  try {
    const response = await axios.get(
      `https://api.clashofclans.com/v1/clans/%23${clanTag}/members`
    );

    const parsedClanMembers = ClanMemberArray.safeParse(response.data.items);
    if (!parsedClanMembers.success) {
      return [];
    }

    return parsedClanMembers.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getPlayerHistory(playerTag: string, listOfFamilyClans: Clan[]) {
  try {
    const response = await axios.get(
      `https://api.clashofstats.com/players/${playerTag.slice(1)}/history/clans`
    );

    const parsedMemberClanHistory = MemberClanHistoryArray.safeParse(
      response.data.summary
    );
    if (!parsedMemberClanHistory.success) {
      return [];
    }

    return parsedMemberClanHistory.data
      .map((clan) => ({
        clanName: listOfFamilyClans.find(
          (familyClan) => "#" + familyClan.clanTag === clan.tag
        )?.clanName,
        clanTag: clan.tag,
        duration: clan.duration,
      }))
      .filter((clan) => clan.clanName); // can't be undefined
  } catch (error: any | AxiosError) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 403) {
        console.error(
          error + " for player " + playerTag + ". History is private."
        );
      } else if (error.response.status === 404) {
        console.error(
          error + " for player " + playerTag + ". Player not found."
        );
      }
    } else {
      console.error(error);
    }
    return [];
  }
}
