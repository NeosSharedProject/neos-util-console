import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import _ from "lodash";
import styled from "styled-components";

const TextFiledStyle = styled.input`
  width: 400px;
`;

const Index = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

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
      <div>
        <form
          onSubmit={handleSubmit(({ link }) => {
            const strLst = _.split(link, "/");
            const recordId = _.last(strLst);
            const ownerId = _.get(strLst, _.size(strLst) - 2);
            router.replace(`/inventory/v1/link/${ownerId}/${recordId}`);
          })}
        >
          <TextFiledStyle
            type="text"
            {...register("link")}
            placeholder="neosrec:///U-xxxx/R-xxxx"
          ></TextFiledStyle>
          <button type="submit">移動</button>
        </form>
      </div>
    </div>
  );
};

export default Index;
