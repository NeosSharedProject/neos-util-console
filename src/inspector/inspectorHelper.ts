import useSWR from "swr";
import { fetcher } from "../helper";
import _ from "lodash";

export function useAssetAsJson(assetId) {
  const url = `https://decompress.kokoa.dev/?id=${assetId}`;
  const result = useSWR<any>(assetId && url, fetcher);
  return result;
}
