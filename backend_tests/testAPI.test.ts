import { expect, test } from "vitest";
import {
  calculateTotalDuration,
  getClanMembers,
  getPlayerHistory,
  mapClan,
  mapClanMembers,
} from "../server/plugins/cronjobs/refreshFruchtLaborCache";
import type { ReturnMember } from "~/types/models/returnMember";

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

test("get clanName from listOfFamilyClans ", async () => {
  // A check to see if the clanName is found in the listOfFamilyClans
  const clan = {
    tag: "#2Y9PPQQC9",
    duration: 100,
  };

  const result = mapClan(clan, listOfFamilyClans);

  expect(result).toEqual({
    clanName: "FruchtLabor CWL",
    clanTag: "#2Y9PPQQC9",
    duration: 100,
  });
});

test("expect Null if its not in listOfFamilyClan ", async () => {
  // A check to see if the clanName is not found in the listOfFamilyClans
  const clan = {
    tag: "#2Y9XPQQC9",
    duration: 100,
  };

  const result = mapClan(clan, listOfFamilyClans);

  expect(result).toBeNull();
});

test("expect there to be some data - case 1", async () => {
  // A check to see if the API returns some data
  const result = await getPlayerHistory("#QLR08CLP", listOfFamilyClans);
  expect(result).not.toEqual([]);
});

test("expect there to be some data - case 2", async () => {
  // A check to see if the API returns some data
  const result2 = await getPlayerHistory("#PP2CY22CQ", listOfFamilyClans);
  expect(result2).toEqual([]);
});

test("expect clan members from getClanMembers", async () => {
  const result = await getClanMembers("28LYJ29CQ");
  expect(result).not.toEqual([]);
});

test("expect maping of mapClanMembers", async () => {
  const result = await mapClanMembers(listOfFamilyClans);
  expect(result).not.toEqual([]);
});

test("calculation of calculateTotalDuration", async () => {
  const familyMembers: ReturnMember = [
    {
      playerName: "Player1",
      playerTag: "#2Y9PPQQC9",
      currentClan: "FruchtLabor CWL",
      currentClanTag: "2Y9PPQQC9",
      totalDuration: 0,
      history: [
        {
          clanName: "FruchtLabor CWL",
          clanTag: "2Y9PPQQC9",
          duration: 100,
        },
        {
          clanName: "FruchtLabor",
          clanTag: "28LYJ29CQ",
          duration: 200,
        },
      ],
    },
  ];

  await calculateTotalDuration(familyMembers);
  expect(familyMembers[0].totalDuration).toEqual(300);
});
