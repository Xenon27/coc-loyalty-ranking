import axios from "axios";
import dotenv from "dotenv";

// TotalDuration in ms
export default defineEventHandler(async (event) => {
  const family = getRouterParam(event, "family");
  if (!family) {
    // not in a list of family names
    return new Response("Please give the name of the family", { status: 404 });
  }
  return await getFamilyMembersDurations();
});

dotenv.config();

const COC_API_TOKEN = process.env.COC_API_TOKEN;
axios.defaults.headers.common["Authorization"] = `Bearer ${COC_API_TOKEN}`;

// This should be somehow set differently and depending on the param
const listOfFamilyClans = [
  { clanName: "FruchtLabor", clanTag: "28LYJ29CQ" },
  { clanName: "FruchtLabor CWL", clanTag: "2Y9PPQQC9" },
  { clanName: "FruchtLabörchen", clanTag: "2RYP8PQRG" },
  { clanName: "Obstsalat", clanTag: "2Q8CL9Y20" },
  { clanName: "Der Obstorden", clanTag: "2Q8QPCUCU" },
  { clanName: "Infructus", clanTag: "2QQJQ2CJP" },
  { clanName: "Beta-Beeren", clanTag: "2LQJP2L0P" },
  { clanName: "Beerenhöhle", clanTag: "2QJL89PJ9" },
  { clanName: "FruchtFliegen", clanTag: "2YL99P9LC" },
  { clanName: "Beerenbrüder", clanTag: "2YGLUYJPR" },
];

async function getFamilyMembersDurations() {
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
