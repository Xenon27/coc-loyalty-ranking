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
  { clanName: "FruchtLabor", clanId: "28LYJ29CQ" },
  { clanName: "FruchtLabor CWL", clanId: "2Y9PPQQC9" },
  { clanName: "FruchtLabörchen", clanId: "2RYP8PQRG" },
  { clanName: "Obstsalat", clanId: "2Q8CL9Y20" },
  { clanName: "Der Obstorden", clanId: "2Q8QPCUCU" },
  { clanName: "Infructus", clanId: "2QQJQ2CJP" },
  { clanName: "Beta-Beeren", clanId: "2LQJP2L0P" },
  { clanName: "Beerenhöhle", clanId: "2QJL89PJ9" },
  { clanName: "FruchtFliegen", clanId: "2YL99P9LC" },
  { clanName: "LazyFruits", clanId: "2LGGJUCLV" },
  { clanName: "Beerenbrüder", clanId: "2YGLUYJPR" },
  { clanName: "BluuTopia", clanId: "2Q2PLLG0V" },
];

async function performScrapingClans() {
  const results: {
    name: string;
    link: string;
    currentClan: string;
    history: { clan: string; duration: string }[];
  }[] = [];

  for (const clan of listOfFamilyClans) {
    console.log(`Scraping clan ${clan.clanName}`);

    const link = `https://www.clashofstats.com/clans/${clan.clanId}/members/table`;

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

        results.push({
          name,
          link,
          currentClan: clan.clanName,
          history: [],
        });
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

    // Selecting and extracting names, tags, and durations
    const results: { clan: string; duration: string }[] = [];
    $(".v-list--three-line .v-list-item").each((_index, element) => {
      const clan = $(element).find(".v-list-item__title").text().trim();
      const duration = $(element).find(".v-list-item__subtitle").text().trim();

      results.push({
        clan,
        duration,
      });
    });

    return results;
  } catch (error) {
    console.error("Error occurred while scraping:", error);
    return [];
  }
}
