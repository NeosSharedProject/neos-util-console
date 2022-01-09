import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import _ from "lodash";

export default (req: NextApiRequest, res: NextApiResponse) => {
  console.log("HELLO");
  if (req.method === "GET") {
    const { ownerId, recordId } = req.query;
    const ownerType = _.startsWith("ownerId", "U-") ? "users" : "groups";
    axios
      .get(
        `https://www.neosvr-api.com/api/${ownerType}/${ownerId}/records/${recordId}`
      )
      .then((response) => {
        const { name, path } = response.data;
        const fiexdPath = _.join([path, name], "\\");
        axios
          .get(
            `https://www.neosvr-api.com/api/${ownerType}/${ownerId}/records?path=${fiexdPath}`
          )
          .then((response) => {
            console.log(_(response).reject((_, key) => key == "data"));
            res.setHeader("Content-Type", "application/json");
            res.status(200).json(response.data);
          });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("error");
      });
  } else {
    res.status(404).send("error");
  }
};
