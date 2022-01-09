import _, { identity } from "lodash";
import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import styled from "styled-components";

const GridStyle = styled.div`
  display: grid;
`;

const ItemStyle = styled.div`
  height: 100px;
  background-color: skyblue;
  padding: 12px;
  margin: 8px;
  .title {
  }
`;

async function fetcher(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}

const Index = () => {
  const router = useRouter();
  const { recordId, ownerId } = router.query;
  const { data } = useSWR<{ ownerId: string; path: string }>(
    ownerId && recordId
      ? `/api/inventory/v1/link?ownerId=${ownerId}&recordId=${recordId}`
      : null,
    fetcher
  );
  useEffect(() => {
    const { ownerId, path } = data;
    console.log(ownerId, path);
    if (ownerId && path) {
      router.replace(`/inventory/v1/viewer/${ownerId}/${path}`);
    }
  }, [data]);
  return <p>LOADING</p>;
};

export default Index;
