import _ from "lodash";
import useSWR from "swr";
import { useEffect } from "react";
import { useRouter } from "next/router";
import {download, downloadBinary, fetcher, parseJson, useLocalStorage} from "../helper";

export function getOwnerIdAndRecordIdFromRecordUri(recordUri: string) {
  const strList = _.split(recordUri, "/");
  const recordId = _.last(strList);
  const ownerId = _.get(strList, _.size(strList) - 2);
  return { ownerId: ownerId, recordId: recordId };
}

export function getPath(slug: string | Array<string>) {
  if (typeof slug === "string") {
    return encodeURI(slug);
  }
  return _(slug)
    .map((text) => encodeURI(text))
    .join("/");
}
function getAssetOwnerId({ ownerId, recordType, assetUri }: RecordInterface) {
  return recordType === "link"
    ? _.get(_.split(assetUri, "/"), 3, assetUri)
    : ownerId;
}

function getWebThumbnailUri({ thumbnailUri }: RecordInterface) {
  return thumbnailUri
    ? "https://assets.neos.com/assets/" +
        _.first(_.split(_.last(_.split(thumbnailUri, "/")), "."))
    : undefined;
}

function getRecordUri({ ownerId, id }: RecordInterface) {
  return `neosrec:///${ownerId}/${id}`;
}

function getAssetId({ assetUri }: RecordInterface) {
  return _.first(_.split(_.last(_.split(assetUri, "/")), "."));
}

function getCurrentDirectoryName({ path }: RecordInterface) {
  return _.last(_.split(path, /\\|\//));
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

function getLink(record: RecordInterface): LinkInterface {
  const { recordType, name, ownerId, id: recordId, path, assetUri } = record;
  const assetOwnerId = getAssetOwnerId(record);
  const assetId = getAssetId(record);

  switch (recordType) {
    case "link":
      return {
        name,
        link: assetUri,
        ownerId: assetOwnerId,
        recordId: assetId,
        path,
      };
    case "directory":
      return {
        name,
        link: getRecordUri(record),
        ownerId,
        path,
        recordId,
      };
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

interface RecordInterface {
  id: string;
  recordType: string;
  name: string;
  thumbnailUri: string;
  creationTime: string;
  ownerId: string;
  ownerName: string;
  lastModificationTime: string;
  lastModifyingUserId: string;
  path: string;
  assetUri?: string;
}

export function useInventory(ownerId: string, path: string) {
  const result = useSWR<RecordInterface[]>(
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
      link: getLink(record),
    };
  });
  return { ...result, ...{ data } };
}

export function useInventoryLinkActive(ownerId: string, path: string) {
  return useInventory(ownerId, path);
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
      router.replace(
        `/inventory/v1/viewer/${ownerId}/${encodeURI(
          _.replace(path, /\\/g, "/")
        )}`
      );
    }
  }, [data]);
}

export async function downloadAssetAs7zbson(assetId: string, name: string) {
  await downloadBinary(`/neos/assets/${assetId}`, `${name}.7zbson`);
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

export interface LinkInterface {
  name: string;
  link: string;
  ownerId: string;
  recordId: string;
  path: string;
}

export function useLocalLinks() {
  const [state, setState] = useLocalStorage("Inventory.LocalLinks");
  if (typeof setState === "string") {
    throw new Error(
      `type error. state is ${typeof state}. setState is ${typeof setState}`
    );
  }
  const links = parseJson(typeof state === "string" ? state : "[]", []);
  const setLinks = (newLinks: LinkInterface[]) => {
    setState(JSON.stringify(newLinks));
  };
  const getLink = (link: string): LinkInterface =>
    _.find(links, ({ link: linkOfList }) => link == linkOfList);

  const pushLink = (newLink: LinkInterface): void => {
    if (!getLink(newLink.link)) {
      setLinks([...links, newLink]);
    }
  };
  const removeLink = (link: string): void => {
    setLinks(_.reject(links, ({ link: linkOfList }) => link == linkOfList));
  };
  return { links, getLink, setLinks, pushLink, removeLink };
}
