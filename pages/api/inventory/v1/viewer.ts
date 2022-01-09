import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import _ from "lodash";

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log("HELLO");
  if (req.method === "GET") {
    const { ownerId, path } = req.query;
    const ownerType = _.startsWith("ownerId", "U-") ? "users" : "groups";

    const fixedPath = _.replace(path as string, new RegExp("/", "g"), "\\");

    axios
      .get(
        `https://www.neosvr-api.com/api/${ownerType}/${ownerId}/records?path=${fixedPath}`
      )
      .then((response) => {
        console.log(response);
        res.setHeader("Content-Type", "application/json");
        res.status(200).json(response.data);
      });
  }
};
