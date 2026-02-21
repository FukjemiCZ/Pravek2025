import Shell from "@/app/components/layout/Shell";
import { getProductModel } from "@/app/lib/getProductModel";

import DomainsSection from "@/app/components/sections/DomainsSection";
import CapabilitiesSection from "@/app/components/sections/CapabilitiesSection";
import ServicesSection from "@/app/components/sections/ServicesSection";
import EventsSection from "@/app/components/sections/EventsSection";
import RoadmapSection from "@/app/components/sections/RoadmapSection";
import GraphSection from "@/app/components/sections/GraphSection";

export const dynamic = "force-dynamic";

export default async function ArchitecturePage() {
  const data = await getProductModel();

  return (
    <Shell>
      <DomainsSection domains={data.catalog?.domains} />
      <CapabilitiesSection capabilities={data.catalog?.capabilities} />
      <ServicesSection services={data.catalog?.services} />
      <EventsSection events={data.catalog?.events} />
      <RoadmapSection roadmap={data.roadmap} />
      <GraphSection relations={data.catalog?.relations} />
    </Shell>
  );
}