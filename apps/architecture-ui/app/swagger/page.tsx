import Shell from "@/app/components/layout/Shell";
import SwaggerView from "@/app/components/swagger/SwaggerView";

export const dynamic = "force-dynamic";

export default function SwaggerPage() {
  return (
    <Shell>
      <SwaggerView />
    </Shell>
  );
}