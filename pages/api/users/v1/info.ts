import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import _ from "lodash";
import json2emap from "json2emap";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { userId, useEmap = false } = req.query;

    const responses = await Promise.all([
      axios.get(`https://api.neos.com/api/users/${userId}`),
      axios.get(`https://api.neos.com/api/users/${userId}/status`),
    ]);

    const result = { info: responses[0].data, status: responses[1].data };

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(useEmap ? json2emap(result) : result);
  }
};
