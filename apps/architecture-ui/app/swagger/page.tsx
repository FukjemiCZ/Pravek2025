import Shell from "@/app/components/layout/Shell";
import OpenApiExplorer from "@/app/components/swagger/OpenApiExplorer";

export const dynamic = "force-dynamic";

export default function SwaggerPage() {
  return (
    <Shell>
      <OpenApiExplorer />
    </Shell>
  );
}