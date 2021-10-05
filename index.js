const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
require("dotenv").config();

const getPriceFeed = async () => {
  try {
    const siteUrl = process.env.SITE_URL;
    const { data } = await getPriceFeedData(siteUrl);
    const $ = cheerio.load(data);
    const keys = getPriceFeedKeys();
    const elementSelector = ".h7vnx2-2 > tbody:nth-child(3) > tr";
    return getTdValueText($, elementSelector, keys);
  } catch (error) {
    console.error(error);
  }
};

const app = express();

app.get("/api/price-feed", async (req, res) => {
  try {
    const priceFeed = await getPriceFeed();
    return res.status(200).json({
      result: priceFeed,
    });
  } catch (error) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

app.listen(3000, () => {
  console.log("Running on port 3000");
});

const getPriceFeedData = async (url) => {
  return await axios({
    method: "GET",
    url: url,
  });
};

const getPriceFeedKeys = () => {
  const keys = [
    "rank",
    "name",
    "price",
    "24h",
    "7d",
    "marketCap",
    "volume",
    "circulationsSupply",
  ];

  return keys;
};

const getTdValueText = ($, elementSelector, keys) => {
  const coinArray = [];
  $(elementSelector).each((parentIndex, parentElement) => {
    const coinObject = {};
    let keyIndex = 0;
    if (parentIndex < 10) {
      $(parentElement)
        .children()
        .each((childIndex, childElement) => {
          const childElementText = getChildElementText(
            $,
            childElement,
            keyIndex
          );
          if (childElementText) {
            coinObject[keys[keyIndex]] = childElementText;
            keyIndex++;
          }
        });
      coinArray.push(coinObject);
    }
  });
  return coinArray;
};

const getChildElementText = ($, childElement, keyIndex) => {
  let tdValue = $(childElement).text();

  if (keyIndex === 1 || keyIndex === 6) {
    tdValue =
      $("p:first-child", $(childElement).html()).text() +
      " " +
      $("p:nth-child(2)", $(childElement).html()).text();
  }
  return tdValue;
};
