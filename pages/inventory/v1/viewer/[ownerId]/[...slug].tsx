import _ from "lodash";
import { useRouter } from "next/router";
import useSWR from "swr";
import styled from "styled-components";

const GridStyle = styled.div`
  display: grid;
`;

const ItemStyle = styled.div<{ backColor: string }>`
  height: 25px;
  background-color: ${({ backColor }) => backColor};
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
  const { slug, ownerId } = router.query;

  const path = _.join(slug, "/");
  const currentDir = _.last(slug);

  const colorMap = {
    object: "skyblue",
    directory: "yellow",
    link: "orange",
  };
  const orderMap = {
    object: 1,
    directory: 0,
    link: 0,
  };

  const { data } = useSWR<
    [{ id: string; recordType: string; name: string; assetUri: string }]
  >(
    ownerId && path
      ? `/api/inventory/v1/viewer?ownerId=${ownerId}&path=${path}`
      : null,
    fetcher
  );
  return (
    <GridStyle>
      {_(data)
        .sortBy(({ recordType, name }) => [
          _.get(orderMap, recordType, -1),
          name,
        ])
        .map(({ recordType, name, assetUri }) => {
          const assetId = _.last(_.split(assetUri, "/"));
          console.log(assetUri);
          return (
            <ItemStyle backColor={_.get(colorMap, recordType, "skyblue")}>
              <div className="title">
                {recordType === "object" && (
                  <button
                    onClick={async () => {
                      console.log("he");
                      const response = await fetch(
                        `https://decompress.kokoa.dev/?id=${_.first(
                          _.split(assetId, ".")
                        )}`
                      );
                      const data = await response.text();
                      console.log("aa", data);
                      const blob = new Blob([data]);
                      const element = document.createElement("a");
                      element.href = window.URL.createObjectURL(blob);
                      element.setAttribute("download", `${name}.json`);
                      document.body.appendChild(element);
                      element.click();
                      element.remove();
                    }}
                  >
                    {_.slice(name, 0, 256)}
                  </button>
                  // <a
                  //   href={`https://decompress.kokoa.dev/?id=${_.first(
                  //     _.split(assetId, ".")
                  //   )}`}
                  //   download
                  // >
                  //   {_.slice(name, 0, 256)}
                  // </a>
                )}
                {recordType === "link" && (
                  <a href={`/inventory/v1/link/${ownerId}/${assetId}`}>
                    {_.slice(name, 0, 256)}
                  </a>
                )}
                {recordType === "directory" && (
                  <a href={`${currentDir}/${name}`}>{_.slice(name, 0, 256)}</a>
                )}
              </div>
            </ItemStyle>
          );
        })
        .value()}
    </GridStyle>
  );
};

export default Index;
