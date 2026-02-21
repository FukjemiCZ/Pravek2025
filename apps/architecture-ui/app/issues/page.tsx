import Shell from "@/app/components/layout/Shell";
import IssuesHub from "@/app/components/issues/IssuesHub";

export const dynamic = "force-dynamic";

export default function IssuesPage() {
  return (
    <Shell>
      <IssuesHub />
    </Shell>
  );
}