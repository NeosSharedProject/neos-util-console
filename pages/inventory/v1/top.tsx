import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import _ from "lodash";
import styled from "styled-components";
import { useLocalLinks } from "../../../src/inventory/inventoryHelper";

const TextFiledStyle = styled.input`
  width: 400px;
`;

const Index = () => {
  const router = useRouter();
  const { register, handleSubmit, getValues } = useForm();
  const { links, pushLink, getLink, removeLink } = useLocalLinks();

  return (
    <div>
      <div>
        <a href="/inventory/v1/viewer/G-Neos/Inventory/Essential Tools">
          Essential Tools
        </a>
      </div>
      <div>
        <a href="/inventory/v1/viewer/G-Neos/Inventory/Neos Essentials">
          Neos Essentials
        </a>
      </div>
      <div>
        <a href="/inventory/v1/viewer/G-Shared-Project-rheni/Inventory/JP Publics">
          JP Publics
        </a>
      </div>
      <div>
        <a href="/inventory/v1/viewer/U-rhenium/Inventory/rhenium Public">
          rhenium Public
        </a>
      </div>
      <p>Local Bookmark</p>
      {_.map(links, ({ name, link, ownerId, recordId, path }) => (
        <div>
          <button
            onClick={async () => {
              if (window.confirm(`delete ${name}?`)) {
                removeLink(link);
              }
            }}
          >
            Delete
          </button>
          <a href={`/inventory/v1/link/${ownerId}/${recordId}`}>
            {name} （{ownerId}/{path}）
          </a>
        </div>
      ))}
      <div>
        <form onSubmit={handleSubmit(async () => {})}>
          <TextFiledStyle
            type="text"
            {...register("link")}
            placeholder="neosrec:///U-xxxx/R-xxxx"
          ></TextFiledStyle>
          <button
            onClick={async () => {
              const { link } = getValues();
              const strLst = _.split(link, "/");
              const recordId = _.last(strLst);
              const ownerId = _.get(strLst, _.size(strLst) - 2);
              const sameLink = getLink(link);
              if (!sameLink) {
                const record = await (
                  await fetch(
                    `/api/inventory/v1/link?ownerId=${ownerId}&recordId=${recordId}`
                  )
                ).json();
                const { name, path } = record;
                pushLink({ link, ownerId, recordId, path, name });
              } else {
                window.alert(`"${sameLink.name}" is already exists.`);
              }
            }}
          >
            Add
          </button>
          <button
            onClick={() => {
              const { link } = getValues();
              const strLst = _.split(link, "/");
              const recordId = _.last(strLst);
              const ownerId = _.get(strLst, _.size(strLst) - 2);
              router.replace(`/inventory/v1/link/${ownerId}/${recordId}`);
            }}
          >
            Go
          </button>
        </form>
      </div>
    </div>
  );
};

export default Index;
