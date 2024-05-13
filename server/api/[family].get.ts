export default defineEventHandler(async (event) => {
  const family = getRouterParam(event, "family");
  if (!family) {
    throw createError({
      statusCode: 400,
      statusMessage: "Family not found.",
    });
  }

  const returnResults = await useStorage("data").getItem(family + "Members");

  if (returnResults) {
    console.log("Returning cached data.");
    return returnResults;
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: "DataResponse not found.",
    });
  }
});
