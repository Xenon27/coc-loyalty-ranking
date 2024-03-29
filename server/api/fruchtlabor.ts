import axios from "axios";
import dotenv from "dotenv";

// duration in ms
export default defineEventHandler(async () => {
  return await getFamilyMembersDurations();
});

dotenv.config();

const COC_API_TOKEN = process.env.COC_API_TOKEN;
axios.defaults.headers.common["Authorization"] = `Bearer ${COC_API_TOKEN}`;

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
  { clanName: "LazyFruits", clanTag: "2LGGJUCLV" },
  { clanName: "Beerenbrüder", clanTag: "2YGLUYJPR" },
  { clanName: "BluuTopia", clanTag: "2Q2PLLG0V" },
];

async function getFamilyMembersDurations() {
  let familyMembers: any = [];

  await Promise.all(
    listOfFamilyClans.map(async (clan) => {
      console.log(clan.clanName);
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
              history: await getPlayerHistory(member.tag), // todo: returns any atm
            };
          })
        ))
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

    return response.data.summary.map((clan: any) => ({
      clanTag: clan.tag,
      duration: clan.duration,
    }));
  } catch (error) {
    console.error(error + " for player " + playerTag);
    return [];
  }
}
