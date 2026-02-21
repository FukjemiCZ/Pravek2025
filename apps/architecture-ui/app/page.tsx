import Shell from "@/app/components/layout/Shell";
import StatusPanel from "@/app/components/status/StatusPanel";
import RuntimePanel from "@/app/components/runtime/RuntimePanel";
import { getProductModel } from "@/app/lib/getProductModel";

export default async function HomePage() {
  const data = await getProductModel();

  return (
    <Shell>
      <h1>Architecture Overview</h1>

      <StatusPanel />

      <RuntimePanel runtime={data.runtime} />
    </Shell>
  );
}