import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import _ from "lodash";
import styled from "styled-components";
import {
  getOwnerIdAndRecordIdFromRecordUri,
  useLocalLinks,
} from "../../../src/inventory/inventoryHelper";
import {
  Button,
  Container,
  Stack,
  TextField,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
} from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRightAlt";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudIcon from "@mui/icons-material/Cloud";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const TextFiledStyle = styled.input`
  width: 400px;
`;

function LinkItem({
  name,
  link,
  ownerId,
  path,
  removeLink,
  recordId,
}: {
  name: string;
  ownerId: string;
  path: string;
  recordId?: string;
  removeLink?: (link: string) => void;
  link?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    //https://github.com/rheniumNV/neos-util-console/issues/17
    //一旦使えるようにする。
    if (recordId) {
      router.push(`link/${ownerId}/${recordId}`);
    } else {
      router.push(`viewer/${ownerId}/${path}/${name}`);
    }
  };

  return (
    <ListItemButton sx={{ pl: 4 }}>
      <ListItemIcon onClick={handleOpen}>
        <FolderIcon />
      </ListItemIcon>
      <ListItemText
        primary={name}
        secondary={`${ownerId} / ${_.replace(path, /\\/g, " / ")}`}
        onClick={handleOpen}
      />
      {Boolean(removeLink) && Boolean(link) && (
        <>
          <ListItemIcon>
            <IconButton onClick={handleClickOpen}>
              <DeleteIcon />
            </IconButton>
          </ListItemIcon>
          <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={handleClose}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogTitle id="responsive-dialog-title">
              {`Do you really want to remove "${name}" from your favorites?`}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>{`${ownerId} / ${_.replace(
                path,
                /\\/g,
                " / "
              )} / ${name}`}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  removeLink(link);
                  handleClose();
                }}
                autoFocus
                color={"error"}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </ListItemButton>
  );
}

const Index = () => {
  const router = useRouter();

  const [linkText, setLinkText] = useState("");
  const { ownerId: linkOwnerId, recordId: linkRecordId } =
    getOwnerIdAndRecordIdFromRecordUri(linkText);
  const linkTextIsValid =
    _.startsWith(linkText, "neosrec:///") &&
    (_.startsWith(linkOwnerId, "U-") || _.startsWith(linkOwnerId, "G-")) &&
    _.startsWith(linkRecordId, "R-");
  const linkTextFieldError = !(linkTextIsValid || !linkText);

  const { register, handleSubmit, getValues } = useForm();
  const { links, pushLink, getLink, removeLink } = useLocalLinks();

  const [favoritesOpened, setFavoritesOpened] = React.useState<boolean>(true);
  const [standardOpened, setStandardOpened] = React.useState<boolean>(true);

  return (
    <Container sx={{ paddingTop: 6 }}>
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Stack>
              <TextField
                id="standard-basic"
                label={Boolean(linkText) ? "inventory link" : "Username"}
                variant="standard"
                color={linkTextFieldError ? "primary" : "error"}
                value={linkText}
                onChange={(event) => {
                  setLinkText(event.target.value);
                }}
                error={linkTextFieldError}
                helperText={linkTextFieldError ? "Username" : ""}
              />
            </Stack>
          </Grid>
          <Grid item xs={2}>
            <Stack>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                disabled={!linkTextIsValid}
                onClick={() => {
                  router.replace(
                    `/inventory/v1/link/${linkOwnerId}/${linkRecordId}`
                  );
                }}
              >
                Search
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={2}>
            <Stack>
              <Button
                variant="contained"
                endIcon={<StarIcon />}
                disabled={!linkTextIsValid}
                onClick={async () => {
                  const sameLink = getLink(linkText);
                  if (!sameLink) {
                    const record = await (
                      await fetch(
                        `/api/inventory/v1/link?ownerId=${linkOwnerId}&recordId=${linkRecordId}`
                      )
                    ).json();
                    const { name, path } = record;
                    pushLink({
                      link: linkText,
                      ownerId: linkOwnerId,
                      recordId: linkRecordId,
                      path,
                      name,
                    });
                  } else {
                    window.alert(`"${sameLink.name}" is already exists.`);
                  }
                }}
              >
                Favorite
              </Button>
            </Stack>
          </Grid>
        </Grid>
        <List component="nav" aria-label="main mailbox folders">
          <ListItemButton
            onClick={() => {
              setFavoritesOpened(!favoritesOpened);
            }}
          >
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            <ListItemText primary={`Favorites (${_.size(links)})`} />
            {favoritesOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
          <Collapse in={favoritesOpened} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {_.map(links, (link) => (
                <LinkItem
                  {...link}
                  removeLink={removeLink}
                  key={_.get(link, "recordId")}
                />
              ))}
            </List>
          </Collapse>
          <ListItemButton
            onClick={() => {
              setStandardOpened(!standardOpened);
            }}
          >
            <ListItemIcon>
              <CloudIcon />
            </ListItemIcon>
            <ListItemText primary="Common (5)" />
            {favoritesOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
          <Collapse in={standardOpened} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <LinkItem
                name="Neos Essentials"
                ownerId="G-Neos"
                path="Inventory"
              />
              <LinkItem
                name="Essential Tools"
                ownerId="G-Neos"
                path="Inventory"
              />
              <LinkItem
                name="Creator Jam Public"
                ownerId="U-Medra"
                path="Inventory\CJ"
              />
              <LinkItem
                name="JP Publics"
                ownerId="G-Shared-Project-rheni"
                path="Inventory"
              />
              <LinkItem
                name="1Public Folders"
                ownerId="U-Staccato"
                path="Inventory"
              />
            </List>
          </Collapse>
        </List>
      </Stack>
    </Container>
  );
};

export default Index;
