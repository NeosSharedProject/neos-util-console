import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import _ from "lodash";
import json2emap from "json2emap";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      const { ownerId, recordId, useEmap } = req.query;
      const ownerType = _.startsWith(ownerId as string, "U-")
        ? "users"
        : "groups";
      const response = await axios.get(
        `https://cloudx.azurewebsites.net/api/${ownerType}/${ownerId}/records/${recordId}`
      );
      const { name, path } = response.data;
      const fiexdPath = _.join([path, name], "\\");
      const result = { ownerId, path: fiexdPath, name };
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
