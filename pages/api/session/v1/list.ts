import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import _ from "lodash";
import json2emap from "json2emap";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const { useEmap, rejectKeys = [] } = req.query;
      const response = await axios.get(
        `https://api.neos.com/api/sessions?includeEmptyHeadless=false&minActiveUsers=1`
      );
      const result = _.map(response.data, (session) =>
        _(session)
          .map((value, key) => ({ key, value }))
          .reject(({ key }) => _.includes(rejectKeys, `${key}`))
          .reduce((prev, { key, value }) => ({ ...prev, [key]: value }), {})
      );
      res.setHeader("Content-Type", "application/json");
      res.status(200).json(useEmap ? json2emap(result) : result);
    } catch (error) {
      console.error(error);
      res.status(500).send("error");
    }
  } else {
    res.status(404).send("error");
  }
};
