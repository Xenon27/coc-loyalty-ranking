import cheerio from "cheerio";
import axios from "axios";

export default defineEventHandler(async () => {
  const results = await performScrapingClans();
  for (const result of results) {
    console.log(`Scraping member ${result.name}`);
    const history = await performScrapingMember(result.link);
    result.history = history;
  }
  return results;
});

const listOfFamilyClans = [
  { clanName: "FruchtLabor", clanId: "#28LYJ29CQ" },
  // { clanName: "FruchtLabor CWL", clanId: "#2Y9PPQQC9" },
  // { clanName: "FruchtLabörchen", clanId: "#2RYP8PQRG" },
  // { clanName: "Obstsalat", clanId: "#2Q8CL9Y20" },
  // { clanName: "Der Obstorden", clanId: "#2Q8QPCUCU" },
  // { clanName: "Infructus", clanId: "#2QQJQ2CJP" },
  // { clanName: "Beta-Beeren", clanId: "#2LQJP2L0P" },
  // { clanName: "Beerenhöhle", clanId: "#2QJL89PJ9" },
  // { clanName: "FruchtFliegen", clanId: "#2YL99P9LC" },
  // { clanName: "LazyFruits", clanId: "#2LGGJUCLV" },
  // { clanName: "Beerenbrüder", clanId: "#2YGLUYJPR" },
  // { clanName: "BluuTopia", clanId: "#2Q2PLLG0V" },
];

async function performScrapingClans() {
  const results: {
    name: string;
    link: string;
    currentClan: string;
    history: { clan: string; durationText: string; durationNumber: number }[];
  }[] = [];

  for (const clan of listOfFamilyClans) {
    console.log(`Scraping clan ${clan.clanName}`);

    const link = `https://www.clashofstats.com/clans/${clan.clanId.replace(
      "#",
      ""
    )}/members/table`;

    try {
      const axiosResponse = await axios.get(link, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        },
      });

      const $ = cheerio.load(axiosResponse.data);

      $(".no-link").each((_index, element) => {
        const name = $(element)
          .find(".r-val__text > div:first-child")
          .text()
          .trim();
        const link =
          $(element).attr("href")?.replace("summary", "history") ?? "";

        if (!link.includes("https://vuetifyjs.com/")) {
          results.push({
            name,
            link,
            currentClan: clan.clanName,
            history: [],
          });
        }
      });
    } catch (error) {
      console.error("Error occurred while scraping:", error);
      return [];
    }
  }

  return results;
}

async function performScrapingMember(link: string) {
  try {
    const axiosResponse = await axios.get(
      "https://www.clashofstats.com" + link,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        },
      }
    );

    const $ = cheerio.load(axiosResponse.data);

    // Selecting and extracting clan name and the stay durations
    const results: {
      clan: string;
      durationText: string;
      durationNumber: number;
    }[] = [];
    $(".v-list--three-line .v-list-item").each((_index, element) => {
      const clan = $(element)
        .find(".v-list-item__title span.text--secondary.caption")
        .text()
        .trim()
        .replace("- ", "");
      const durationText = $(element)
        .find(".v-list-item__subtitle > div:first-child")
        .contents()
        .filter(function () {
          return this.nodeType === 3;
        })
        .text()
        .trim();

      const foundClan = listOfFamilyClans.find(
        (familyClan) => familyClan.clanId === clan
      );

      if (!foundClan) return;

      results.push({
        clan,
        durationText,
        durationNumber: durationToSeconds(durationText),
      });
    });

    return results;
  } catch (error) {
    console.error("Error occurred while scraping:", error);
    return [];
  }
}

function durationToSeconds(duration: string) {
  // Assuming the duration format is "Total X Months Y Days"
  // Could also be "Total X Years Y Months Z Days" or "Total Y Days"
  duration = duration.replace("Total ", "");
  const parts = duration.split(" ");
  let totalSeconds = 0;

  for (let i = 0; i < parts.length; i += 2) {
    const value = parseInt(parts[i]);
    const unit = parts[i + 1];
    if (unit.toLowerCase().startsWith("year")) {
      totalSeconds += value * 365 * 24 * 60 * 60; // Assuming 365 days per year
      continue;
    }
    if (unit.toLowerCase().startsWith("month")) {
      totalSeconds += value * 30 * 24 * 60 * 60; // Assuming 30 days per month
      continue;
    }
    if (unit.toLowerCase().startsWith("day")) {
      totalSeconds += value * 24 * 60 * 60;
      continue;
    }
  }

  return totalSeconds;
}
