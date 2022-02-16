import React, { useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import {
  downloadAssetAs7zbson,
  downloadAssetAsJson,
  downloadAssetAsNeosScript,
  useLocalLinks,
  LinkInterface,
} from "../inventoryHelper";
import { copy, useLocalStorage } from "../../helper";

const ItemStyle = styled.div<{ backColor: string; isFav: boolean }>`
  background-color: ${({ backColor }) => backColor};
  border: 2px solid ${({ backColor }) => backColor};
  ${({ isFav }) => (isFav ? "border: 2px solid orange;" : "")}display: block;
  clear: both;
  width: 200px;
  height: 200px;
  padding: 20px;
  margin: 2px;
`;

const ContentAreaStyle = styled.div`
  overflow: hidden;
  height: 100%;
  padding: 5px;
`;

const ThumbnailStyle = styled.img`
  border-radius: 15px;
  width: 100% !important;
  height: 180px !important;
  background: #fff;
`;

const TitleAreaStyle = styled.div`
  overflow: hidden;
  width: 100%;
  display: block;
  clear: both;
  text-align: center;
  color: #333;
  font-size: 16px;
  .label {
    display: block;
    width: 100%;
    text-align: left;
    color: rgb(0, 0, 0);
    font-size: 14px;
    padding: 10px 0;
    line-height: 1.5;
  }
`;

const ControlPanelStyle = styled.div`
  position: absolute;
  margin-left: 130px;
  margin-top: 50px;
  background: #ccc;
  display: flex;
  flex-direction: column;
  width: 200px;
  border-radius: 3px;
  padding: 10px;
  .title {
    height: 50px;
    overflow: hidden;
  }
  &:before {
    content: "";
    position: absolute;
    top: 50%;
    left: -30px;
    right: 220px;
    margin-top: -15px;
    border: 15px solid transparent;
    border-right: 15px solid #ccc;
  }
`;

const CardButtonStyle = styled.button`
  clear: both;
  overflow: hidden;
  padding: 5px;
  margin: 1px;
  color: #fff;
  font-size: 75%;
  background: rgb(43, 50, 87);
  &:hover {
    background: rgb(103, 110, 147);
  }
`;

function CardButton({ name, func }) {
  return (
    <CardButtonStyle
      className="button"
      onClick={() => {
        func();
      }}
    >
      {name}
    </CardButtonStyle>
  );
}

interface CardInput {
  recordType: string;
  name: string;
  recordUri: string;
  viewerLink?: string;
  webThumbnailUri?: string;
  assetId?: string;
  assetUri?: string;
  link?: LinkInterface;
}

const colorMap = {
  directory: "#ffeda8",
  link: "#ffdd9e",
  object: "#eefaff",
};

export function RecordCard({
  recordType,
  name,
  recordUri,
  webThumbnailUri,
  viewerLink,
  assetId,
  assetUri,
  link,
}: CardInput) {
  const [showButton, setShowButton] = useState<boolean>(false);
  const { getLink, pushLink, removeLink } = useLocalLinks();
  const isFav = !!getLink(_.get(link, "link"));
  const [modeState] = useLocalStorage("Util.Mode");
  return (
    <ItemStyle
      backColor={_.get(colorMap, recordType, "white")}
      isFav={isFav}
      onMouseEnter={() => {
        setShowButton(true);
      }}
      onMouseLeave={() => {
        setShowButton(false);
      }}
    >
      <ContentAreaStyle>
        {showButton && (
          <ControlPanelStyle>
            <div className="title">
              {!viewerLink && <label>{_.slice(name, 0, 256)}</label>}
              {viewerLink && <a href={viewerLink}>{_.slice(name, 0, 256)}</a>}
            </div>
            <CardButton
              name="Copy RecordUri"
              func={() => {
                copy(recordUri);
              }}
            />
            {(recordType === "link" || recordType === "directory") && (
              <>
                <CardButton
                  name="Copy InventoryLink"
                  func={() => {
                    copy(recordType === "link" ? assetUri : recordUri);
                  }}
                />
              </>
            )}
            {recordType === "object" && (
              <>
                <CardButton
                  name={"Copy AssetUri"}
                  func={() => {
                    copy(assetUri);
                  }}
                />
                <CardButton
                  name="Download 7zbson"
                  func={() => {
                    downloadAssetAs7zbson(assetId, name);
                  }}
                />
                {modeState == "advanced" && (
                  <>
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
                  </>
                )}
              </>
            )}
            {link && (
              <CardButton
                name={isFav ? "Remove Local Bookmark" : "Save Local Bookmark"}
                func={() => {
                  if (isFav) {
                    removeLink(link.link);
                  } else {
                    pushLink(link);
                  }
                }}
              />
            )}
          </ControlPanelStyle>
        )}
        {webThumbnailUri && <ThumbnailStyle src={webThumbnailUri} />}
        <TitleAreaStyle>
          {!viewerLink && <label>{_.slice(name, 0, 256)}</label>}
          {viewerLink && <a href={viewerLink}>{_.slice(name, 0, 256)}</a>}
        </TitleAreaStyle>
      </ContentAreaStyle>
    </ItemStyle>
  );
}
