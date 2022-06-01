import React from "react";
import useSWR from "swr";
import _ from "lodash";
import { fetcher } from "../../../src/helper";
import SessionCard from "./SessionCard";
import styled from "styled-components";
import { Grid, Container } from "@mui/material";

export default function Index(_prop) {
  const { data: sessions } = useSWR(
    "/api/session/v1/list?rejectTags=[tags]",
    fetcher
  );

  return (
    <Container sx={{ paddingTop: 6, paddingBottom: 6 }}>
      <Grid
        container
        spacing={2}
        alignItems={"center"}
        justifyItems={"center"}
        justifyContent={"center"}
      >
        {_.map(sessions ?? [], (session) => {
          return (
            <Grid item key={session.id}>
              <SessionCard session={session}></SessionCard>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
