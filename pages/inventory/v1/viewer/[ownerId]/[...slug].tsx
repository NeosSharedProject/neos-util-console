import _ from "lodash";
import { useRouter } from "next/router";
import useSWR from "swr";
import styled from "styled-components";

const GridStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

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

async function fetcher(url: string): Promise<any> {
  const response = await fetch(url);
  return response.json();
}

const Index = () => {
  const router = useRouter();
  const { slug, ownerId } = router.query;

  const path = _.join(
    _.map(slug, (str) => encodeURI(str)),
    "/"
  );
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
    [
      {
        id: string;
        recordType: string;
        name: string;
        assetUri: string;
        thumbnailUri: string;
        ownerId: string;
        creationTime: string;
      }
    ]
  >(
    ownerId && path
      ? `/api/inventory/v1/viewer?ownerId=${ownerId}&path=${path}`
      : null,
    fetcher
  );
  return (
    <div>
      <GridStyle>
        {_(data)
          .sortBy(({ recordType, name, creationTime }) => [
            _.get(orderMap, recordType, -1),
            recordType === "object" ? creationTime : name,
          ])
          .map(
            ({
              id,
              recordType,
              name,
              assetUri,
              thumbnailUri,
              ownerId: assetOwnerId,
              creationTime,
            }) => {
              const assetId = _.first(
                _.split(_.last(_.split(assetUri, "/")), ".")
              );
              const ownerId =
                recordType === "link"
                  ? _.get(_.split(assetUri, "/"), 3, assetUri)
                  : assetOwnerId;
              const neosrecUri = `neosrec:///${ownerId}/${id}`;
              const fixedThumbnailUri =
                "https://assets.neos.com/assets/" +
                _.first(_.split(_.last(_.split(thumbnailUri, "/")), "."));
              return (
                <ItemStyle backColor={_.get(colorMap, recordType, "skyblue")}>
                  <div className="title">
                    {recordType === "object" && (
                      <div>
                        <img className="thumbnail" src={fixedThumbnailUri} />
                        <label>{_.slice(name, 0, 256)}</label>
                        <button
                          className="button"
                          onClick={async () => {
                            const response = await fetch(
                              `neos/assets/${assetId}`
                            );
                            const data = await response.text();
                            const blob = new Blob([data]);
                            const element = document.createElement("a");
                            element.href = window.URL.createObjectURL(blob);
                            element.setAttribute("download", `${name}.7zbson`);
                            document.body.appendChild(element);
                            element.click();
                            element.remove();
                          }}
                        >
                          Download 7zbson
                        </button>
                        <button
                          className="button"
                          onClick={async () => {
                            const response = await fetch(
                              `https://decompress.kokoa.dev/?id=${assetId}`
                            );
                            const data = await response.text();
                            const blob = new Blob([data]);
                            const element = document.createElement("a");
                            element.href = window.URL.createObjectURL(blob);
                            element.setAttribute("download", `${name}.json`);
                            document.body.appendChild(element);
                            element.click();
                            element.remove();
                          }}
                        >
                          Download json
                        </button>
                        <button
                          className="button"
                          onClick={() => {
                            navigator.clipboard.writeText(assetUri);
                          }}
                        >
                          Copy AssetUri
                        </button>
                        <button
                          className="button"
                          onClick={() => {
                            navigator.clipboard.writeText(neosrecUri);
                          }}
                        >
                          Copy RecordUri
                        </button>
                      </div>
                    )}
                    {recordType === "link" && (
                      <div>
                        <div className="empty_thumbnail" />
                        <a href={`/inventory/v1/link/${ownerId}/${assetId}`}>
                          {_.slice(name, 0, 256)}
                        </a>
                        <button
                          className="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `neosrec:///${ownerId}/${assetId}`
                            );
                          }}
                        >
                          Copy linkUrl
                        </button>
                        <button
                          className="button"
                          onClick={() => {
                            navigator.clipboard.writeText(neosrecUri);
                          }}
                        >
                          Copy RecordUri
                        </button>
                      </div>
                    )}
                    {recordType === "directory" && (
                      <div>
                        <div className="empty_thumbnail" />
                        <a href={`${currentDir}/${encodeURI(name)}`}>
                          {_.slice(name, 0, 256)}
                        </a>
                        <button
                          className="button"
                          onClick={() => {
                            navigator.clipboard.writeText(neosrecUri);
                          }}
                        >
                          Copy RecordUri
                        </button>
                      </div>
                    )}
                  </div>
                </ItemStyle>
              );
            }
          )
          .value()}
      </GridStyle>
    </div>
  );
};

export default Index;
