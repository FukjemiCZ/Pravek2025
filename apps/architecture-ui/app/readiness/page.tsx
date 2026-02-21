import Shell from "@/app/components/layout/Shell";
import ReadinessPanel from "@/app/components/operations/ReadinessPanel";

export const dynamic = "force-dynamic";

export default function ReadinessPage() {
  return (
    <Shell>
      <ReadinessPanel />
    </Shell>
  );
}