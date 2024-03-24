import cheerio from "cheerio";
import axios from "axios";

export default defineEventHandler((event) => {
  return performScraping();
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

async function performScraping() {
  try {
    const axiosResponse = await axios.get(
      "https://www.clashofstats.com/players/YLL080LG/history/",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        },
      }
    );

    const $ = cheerio.load(axiosResponse.data);

    // Selecting and extracting names, tags, and durations
    const results = [];
    $(".v-list--three-line .v-list-item").each((index, element) => {
      const name = $(element).find(".v-list-item__title").text().trim();
      const tag = $(element).find(".text--secondary.caption").text().trim();
      const duration = $(element).find(".v-list-item__subtitle").text().trim();

      results.push({
        name,
        tag,
        duration,
      });
    });

    return results;
  } catch (error) {
    console.error("Error occurred while scraping:", error);
    return [];
  }
}
