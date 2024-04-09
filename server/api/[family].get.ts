import axios from "axios";
import dotenv from "dotenv";
import { Clan } from "~/types/models/clan";

// TotalDuration in ms
export default defineEventHandler(async (event) => {
  const family = getRouterParam(event, "family");
  if (!family) {
    // not in a list of family names
    throw createError({
      statusCode: 400,
      statusMessage: "Family not found.",
    });
  }

  listOfFamilyClans = await useStorage("data").getItem("FruchtLabor");

  return await getFamilyMembersDurations(listOfFamilyClans);
});

dotenv.config();
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.COC_API_TOKEN}`;

let listOfFamilyClans: Clan[];

async function getFamilyMembersDurations(listOfFamilyClans: any) {
  let familyMembers: any = [];

  await Promise.all(
    listOfFamilyClans.map(async (clan) => {
      const members = await getClanMembers(clan.clanTag);
      familyMembers.push(
        ...(await Promise.all(
          members.map(async (member: { name: string; tag: string }) => {
            // todo: error handling for type
            return {
              playerName: member.name,
              playerTag: member.tag,
              currentClan: clan.clanName,
              currentClanTag: clan.clanTag,
              totalDuration: 0,
              history: await getPlayerHistory(member.tag), // todo: returns any atm
            };
          })
        ))
      );
    })
  );
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
  const response = await axios.get(
    `https://api.clashofclans.com/v1/clans/%23${clanTag}/members`
  );

  return response.data.items.map((member: any) => ({
    tag: member.tag,
    name: member.name,
  }));
}

async function getPlayerHistory(playerTag: string) {
  try {
    const response = await axios.get(
      `https://api.clashofstats.com/players/${playerTag.slice(1)}/history/clans`
    );

    return response.data.summary
      .filter((clan: any) =>
        listOfFamilyClans.some(
          (familyclan) => "#" + familyclan.clanTag === clan.tag
        )
      )
      .map((clan: any) => ({
        clanName: listOfFamilyClans.find(
          (familyClan) => "#" + familyClan.clanTag === clan.tag
        )?.clanName,
        clanTag: clan.tag,
        duration: clan.duration,
      }));
  } catch (error) {
    console.error(error + " for player " + playerTag + ". History is private.");
    return [];
  }
}
