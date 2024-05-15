import axios, { AxiosError } from "axios";
import { Clan, ClanArray } from "~/types/models/clan";
import { ClanMemberArray } from "~/types/models/clanMember";
import {
  MemberClanHistoryArray,
  MemberClanHistory,
} from "~/types/models/memberClanHistory";
import { ReturnMember } from "~/types/models/returnMember";
import dotenv from "dotenv";

dotenv.config();
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.COC_API_TOKEN}`;

export default async () => {
  console.log("Refreshing FruchtLabor Cache at " + new Date().toISOString());

  const family = "FruchtLabor";
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

  const returnResuls = await getFamilyMembersDurations(parseData.data);
  useStorage("data").setItem(family + "Members", returnResuls);
};

async function getFamilyMembersDurations(listOfFamilyClans: Clan[]) {
  const familyMembers = await mapClanMembers(listOfFamilyClans);

  for (const member of familyMembers) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    member.history = member.history.concat(
      await getPlayerHistory(member.playerTag, listOfFamilyClans)
    );
  }

  await calculateTotalDuration(familyMembers);

  return familyMembers;
}

export async function getClanMembers(clanTag: string) {
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

export async function getPlayerHistory(
  playerTag: string,
  listOfFamilyClans: Clan[]
) {
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
      .map((clan) => mapClan(clan, listOfFamilyClans))
      .filter((clan) => clan !== null) as {
      clanName: string;
      clanTag: string;
      duration: number;
    }[];
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

export function mapClan(clan: MemberClanHistory, listOfFamilyClans: Clan[]) {
  const clanName = listOfFamilyClans.find(
    (familyClan) => "#" + familyClan.clanTag === clan.tag
  )?.clanName;

  if (!clanName) {
    return null;
  }

  return {
    clanName,
    clanTag: clan.tag,
    duration: clan.duration,
  };
}

export async function mapClanMembers(clans: Clan[]) {
  const familyMembers: ReturnMember = [];

  await Promise.all(
    clans.map(async (clan) => {
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

  return familyMembers;
}

export async function calculateTotalDuration(familyMembers: ReturnMember) {
  await Promise.all(
    familyMembers.map(async (member) => {
      member.totalDuration = member.history.reduce(
        (totalDuration: number, clan) => totalDuration + clan.duration,
        0
      );
    })
  );
}
