import _ from "lodash";
import useSWR from "swr";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { download, fetcher } from "../helper";

export function getPath(slug: string | Array<string>) {
  if (typeof slug == "string") {
    return encodeURI(slug);
  }
  return _(slug)
    .map((text) => encodeURI(text))
    .join("/");
}
function getAssetOwnerId({ ownerId, recordType, assetUri }) {
  return recordType === "link"
    ? _.get(_.split(assetUri, "/"), 3, assetUri)
    : ownerId;
}

function getWebThumbnailUri({ thumbnailUri }) {
  return thumbnailUri
    ? "https://assets.neos.com/assets/" +
        _.first(_.split(_.last(_.split(thumbnailUri, "/")), "."))
    : undefined;
}

function getRecordUri({ ownerId, id }) {
  return `neosrec:///${ownerId}/${id}`;
}

function getAssetId({ assetUri }) {
  return _.first(_.split(_.last(_.split(assetUri, "/")), "."));
}

function getCurrentDirectoryName({ path }) {
  return _.last(_.split(path, "\\"));
}

function getViewerLink(record) {
  const { name, recordType } = record;
  switch (recordType) {
    case "link":
      const assetOwnerId = getAssetOwnerId(record);
      const assetId = getAssetId(record);
      return `/inventory/v1/link/${assetOwnerId}/${assetId}`;
    case "directory":
      const currentDirectoryName = getCurrentDirectoryName(record);
      return `${currentDirectoryName}/${encodeURI(name)}`;
    default:
      return undefined;
  }
}

const recordKeys = [
  "id",
  "recordType",
  "name",
  "assetUri",
  "thumbnailUri",
  "creationTime",
  "ownerId",
  "ownerName",
  "lastModificationTime",
  "lastModifyingUserId",
  "path",
];

export function useInventory(ownerId: string, path: string) {
  const result = useSWR<
    [
      {
        id: string;
        recordType: string;
        name: string;
        assetUri: string;
        thumbnailUri: string;
        creationTime: string;
        ownerId: string;
        ownerName: string;
        lastModificationTime: string;
        lastModifyingUserId: string;
        path: string;
      }
    ]
  >(
    ownerId && path
      ? `/api/inventory/v1/viewer?ownerId=${ownerId}&path=${path}&keys=${recordKeys}&useSort=true`
      : null,
    fetcher
  );

  const data = _.map(result.data, (record) => {
    const {
      id,
      recordType,
      name,
      assetUri,
      thumbnailUri,
      creationTime,
      ownerId,
      ownerName,
      lastModificationTime,
      lastModifyingUserId,
    } = record;
    return {
      id,
      recordType,
      name,
      assetUri,
      thumbnailUri,
      creationTime,
      ownerId,
      ownerName,
      lastModificationTime,
      lastModifyingUserId,
      assetOwnerId: getAssetOwnerId(record),
      webThumbnailUri: getWebThumbnailUri(record),
      recordUri: getRecordUri(record),
      assetId: getAssetId(record),
      viewerLink: getViewerLink(record),
    };
  });
  return { ...result, ...{ data } };
}

export function useLinkRedirect(ownerId: string, recordId: string) {
  const { data } = useSWR<{ ownerId: string; path: string }>(
    ownerId && recordId
      ? `/api/inventory/v1/link?ownerId=${ownerId}&recordId=${recordId}`
      : null,
    fetcher
  );

  const router = useRouter();
  useEffect(() => {
    const { ownerId, path } = data ?? {};
    if (ownerId && path) {
      router.replace(`/inventory/v1/viewer/${ownerId}/${encodeURI(path)}`);
    }
  }, [data]);
}

export async function downloadAssetAs7zbson(assetId: string, name: string) {
  await download(`neos/assets/${assetId}`, `${name}.7zbson`);
}
export async function downloadAssetAsJson(assetId: string, name: string) {
  await download(`https://decompress.kokoa.dev/?id=${assetId}`, `${name}.json`);
}
export async function downloadAssetAsNeosScript(assetId: string, name: string) {
  await download(
    `/api/inventory/v1/neosscript?id=${_.first(_.split(assetId, "."))}`,
    `${name}.tsx`
  );
}
