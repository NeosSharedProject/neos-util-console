import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();
  return (
    <div>
      <div>
        <div>
          <label>{"rhenium Public"}</label>
        </div>
        <div>
          <a href="/inventoryViewer/R-32338edd-bd95-4e38-a1ea-a0f24e4ecda6">
            /R-32338edd-bd95-4e38-a1ea-a0f24e4ecda6/
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
