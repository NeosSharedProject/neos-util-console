import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import _ from "lodash";

const Index = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  return (
    <div>
      <div>
        <a href="/inventory/v1/link/U-rhenium/R-32338edd-bd95-4e38-a1ea-a0f24e4ecda6">
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
          <input type="text" {...register("link")}></input>
          <button type="submit">移動</button>
        </form>
      </div>
    </div>
  );
};

export default Index;
