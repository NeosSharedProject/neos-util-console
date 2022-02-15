import React from "react";
import styled from "styled-components";
import {
  downloadAssetAs7zbson,
  downloadAssetAsJson,
  downloadAssetAsNeosScript,
} from "../inventoryHelper";
import { copy } from "../../helper";

const ItemStyle = styled.div<{ backColor: string }>`
  background-color: ${({ backColor }) => backColor};
  border: 1px solid #333;
  display: block;
  clear: both;
  width: 180px;
  padding: 20px;
  .title {
    display: block;
    clear: both;
    text-align: center;
    color: #333;
    font-size: 16px;
  }
  .empty_thumbnail {
    width: 100% !important;
    height: 180px !important;
  }
  .thumbnail {
    width: 100% !important;
    height: 180px !important;
    background: #fff;
    border: 2px solid #a3cfd6;
  }
  .label {
    display: block;
    width: 100%;
    text-align: left;
    color: rgb(0, 0, 0);
    font-size: 14px;
    padding: 10px 0;
    line-height: 1.5;
  }
  .button {
    clear: both;
    overflow: hidden;
    padding: 5px;
    margin: 1px;
    color: #fff;
    font-size: 75%;
    background: rgb(43, 50, 87);
  }
`;

function CardButton({ name, func }) {
  return (
    <button
      className="button"
      onClick={() => {
        func();
      }}
    >
      {name}
    </button>
  );
}

interface CardInput {
  name: string;
  recordUri: string;
  viewerLink?: string;
  webThumbnailUri?: string;
  assetId?: string;
  assetUri?: string;
}

export function DirectoryCard({ name, recordUri, viewerLink }: CardInput) {
  return (
    <ItemStyle backColor={"yellow"}>
      <div>
        <div className="empty_thumbnail" />
        <a href={viewerLink}>{_.slice(name, 0, 256)}</a>
        <CardButton
          name="Copy RecordUri"
          func={() => {
            copy(recordUri);
          }}
        />
      </div>
    </ItemStyle>
  );
}

export function LinkCard({ name, recordUri, viewerLink }: CardInput) {
  return (
    <ItemStyle backColor={"orange"}>
      <div>
        <div className="empty_thumbnail" />
        <a href={viewerLink}>{_.slice(name, 0, 256)}</a>
        <CardButton
          name="Copy RecordUri"
          func={() => {
            copy(recordUri);
          }}
        />
      </div>
    </ItemStyle>
  );
}

export function ObjectCard({
  name,
  recordUri,
  webThumbnailUri,
  assetId,
  assetUri,
}: CardInput) {
  return (
    <ItemStyle backColor={"skyblue"}>
      <div>
        <img className="thumbnail" src={webThumbnailUri} />
        <label>{_.slice(name, 0, 256)}</label>
        <CardButton
          name="Download 7zbson"
          func={() => {
            downloadAssetAs7zbson(assetId, name);
          }}
        />
        <CardButton
          name="Download json"
          func={() => {
            downloadAssetAsJson(assetId, name);
          }}
        />
        <CardButton
          name="Download NeosScript"
          func={() => {
            downloadAssetAsNeosScript(assetId, name);
          }}
        />
        <CardButton
          name="Copy AssetUri"
          func={() => {
            copy(assetUri);
          }}
        />
        <CardButton
          name="Copy RecordUri"
          func={() => {
            copy(recordUri);
          }}
        />
      </div>
    </ItemStyle>
  );
}
