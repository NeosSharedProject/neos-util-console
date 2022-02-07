import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import _ from "lodash";

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log("HELLO");
  if (req.method === "GET") {
    const { ownerId, recordId } = req.query;
    const ownerType = _.startsWith(ownerId as string, "U-")
      ? "users"
      : "groups";
    axios
      .get(
        `https://api.neos.com/api/${ownerType}/${ownerId}/records/${recordId}`
      )
      .then((response) => {
        const { name, path } = response.data;
        const fiexdPath = _.join([path, name], "\\");
        res.setHeader("Content-Type", "application/json");
        res.status(200).json({ ownerId, path: fiexdPath });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("error");
      });
  } else {
    res.status(404).send("error");
  }
};
