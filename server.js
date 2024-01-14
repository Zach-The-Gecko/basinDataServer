import getBasinData from "./getBasinData.js";

import express from "express";
const app = express();

app.get("/data", async (req, res) => {
  const data = JSON.stringify(await getBasinData());
  res.send(data);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
