import React, { useState } from "react";
import _ from "lodash";
import {
  downloadAssetAs7zbson,
  downloadAssetAsJson,
  downloadAssetAsNeosScript,
  useLocalLinks,
  LinkInterface,
} from "../inventoryHelper";
import { copy, useLocalStorage } from "../../helper";
import {
  Alert,
  TableRow,
  TableCell,
  IconButton,
  MenuList,
  Divider,
  Menu,
  Snackbar,
  Link,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import FolderIcon from "@mui/icons-material/Folder";
import CopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import MoreHorizTwoToneIcon from "@mui/icons-material/MoreHorizTwoTone";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import moment from "moment";
import MenuButtonWithLoading from "../../common/component/MenuButtonWithLoading";

interface CardInput {
  recordType: string;
  name: string;
  recordUri: string;
  viewerLink?: string;
  webThumbnailUri?: string;
  assetId?: string;
  assetUri?: string;
  link?: LinkInterface;
  ownerName: string;
  lastModificationTime: string;
  lastModifyingUserId: string;
  assetOwnerId: string;
  creationTime: string;
}

export function RecordCard({
  recordType,
  name,
  recordUri,
  webThumbnailUri,
  viewerLink,
  assetId,
  assetUri,
  link,
  ownerName,
  lastModificationTime,
  lastModifyingUserId,
  assetOwnerId,
  creationTime,
}: CardInput) {
  const [showButton, setShowButton] = useState<boolean>(false);
  const { getLink, pushLink, removeLink } = useLocalLinks();
  const isFav = !!getLink(_.get(link, "link"));
  const [modeState] = useLocalStorage("Util.Mode");

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const menuOpened = Boolean(menuAnchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const [snackbarMessage, setSnackbarMessage] = React.useState<string | null>(
    null
  );
  const handleSetSnackbar = (message: string) => {
    setSnackbarMessage(message);
  };
  const handleCloseSnackbar = () => {
    setSnackbarMessage(null);
  };

  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} hover>
      <TableCell scope="row">
        {(() => {
          switch (recordType) {
            case "directory":
              return (
                <Link color={"rgba(0, 0, 0, 0.54)"} href={viewerLink}>
                  <FolderIcon />
                </Link>
              );
            case "link":
              return (
                <Link color={"rgba(0, 0, 0, 0.54)"} href={viewerLink}>
                  <FolderSharedIcon />
                </Link>
              );
            case "object":
              return <img src={webThumbnailUri} width={30} height={30} />;
            default:
              return null;
          }
        })()}
      </TableCell>
      <TableCell scope="row">
        {recordType == "object" && _.slice(name, 0, 256)}
        {recordType != "object" && (
          <Link color={"#000"} href={viewerLink}>
            {_.slice(name, 0, 256)}
          </Link>
        )}
      </TableCell>
      <TableCell align="right">
        {moment(creationTime).format("YYYY M/D HH:mm")}
      </TableCell>
      {modeState === "advanced" && (
        <TableCell align="right">{lastModifyingUserId}</TableCell>
      )}
      <TableCell align="right">
        {recordType != "object" && (
          <IconButton
            onClick={() => {
              if (isFav) {
                removeLink(link.link);
              } else {
                pushLink(link);
              }
            }}
          >
            {isFav && <StarIcon fontSize="small" />}
            {!isFav && <StarBorderIcon fontSize="small" />}
          </IconButton>
        )}
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={handleMenuOpen}>
          <MoreHorizTwoToneIcon />
        </IconButton>

        <Menu
          open={menuOpened}
          onClose={handleMenuClose}
          anchorEl={menuAnchorEl}
        >
          <MenuList>
            <MenuButtonWithLoading
              handleAction={async () => {
                copy(recordUri);
                setSnackbarMessage("Copy RecordUri");
              }}
              SuccessIcon={CheckIcon}
              DefaultIcon={CopyIcon}
              name={"Copy RecordUri"}
            />
            {recordType === "object" && (
              <>
                <MenuButtonWithLoading
                  handleAction={async () => {
                    copy(assetUri);
                    setSnackbarMessage("Copy AssetUri");
                  }}
                  SuccessIcon={CheckIcon}
                  DefaultIcon={CopyIcon}
                  name={"Copy AssetUri"}
                />
                <Divider />
                <MenuButtonWithLoading
                  handleAction={async () => {
                    await downloadAssetAs7zbson(assetId, name);
                    setSnackbarMessage("Download 7zbson");
                  }}
                  SuccessIcon={DownloadDoneIcon}
                  DefaultIcon={DownloadIcon}
                  name={"Download 7zbson"}
                />
                {modeState === "advanced" && (
                  <>
                    <MenuButtonWithLoading
                      handleAction={async () => {
                        await downloadAssetAsJson(assetId, name);
                        setSnackbarMessage("Download Json");
                      }}
                      SuccessIcon={DownloadDoneIcon}
                      DefaultIcon={DownloadIcon}
                      name={"Download Json"}
                    />
                    <MenuButtonWithLoading
                      handleAction={async () => {
                        await downloadAssetAsNeosScript(assetId, name);
                        setSnackbarMessage("Download NeosScript");
                      }}
                      SuccessIcon={DownloadDoneIcon}
                      DefaultIcon={DownloadIcon}
                      name={"Download NeosScript"}
                    />
                  </>
                )}
              </>
            )}
            {recordType != "object" && (
              <>
                <MenuButtonWithLoading
                  handleAction={async () => {
                    copy(recordType === "link" ? assetUri : recordUri);
                    setSnackbarMessage("Copy InventoryLink");
                  }}
                  SuccessIcon={CheckIcon}
                  DefaultIcon={CopyIcon}
                  name={"Copy InventoryLink"}
                />
              </>
            )}
          </MenuList>
        </Menu>
        <Snackbar
          open={Boolean(snackbarMessage)}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </TableCell>
    </TableRow>
  );
}
