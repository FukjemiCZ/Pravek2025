import fs from "node:fs";
import yaml from "js-yaml";
import { abs } from "./utils";
import {
  VisionSchema,
  DomainsSchema,
  CapabilitiesSchema,
  FlowsSchema,
  ComponentsSchema,
  ServicesSchema,
  ApisSchema,
  EventsSchema,
  SlaSchema,
  RelationsSchema,
  RuntimeSchema,
  OwnershipSchema,
  RoadmapSchema,
  type CompiledModel
} from "./schema";

function loadYaml<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8");
  const doc = yaml.load(raw);
  return doc as T;
}

export function loadProductModel(modelDir = abs("product-model")): CompiledModel {
  // modelDir může být relativní nebo absolutní; abs() to ošetří

  const vision = VisionSchema.parse(loadYaml(abs(modelDir, "01-vision.yaml")));
  const domains = DomainsSchema.parse(loadYaml(abs(modelDir, "02-domains.yaml")));
  const capabilities = CapabilitiesSchema.parse(loadYaml(abs(modelDir, "03-capabilities.yaml")));
  const flows = FlowsSchema.parse(loadYaml(abs(modelDir, "04-user-flows.yaml")));
  const components = ComponentsSchema.parse(loadYaml(abs(modelDir, "05-components.yaml")));
  const services = ServicesSchema.parse(loadYaml(abs(modelDir, "06-services.yaml")));
  const apis = ApisSchema.parse(loadYaml(abs(modelDir, "07-apis.yaml")));
  const events = EventsSchema.parse(loadYaml(abs(modelDir, "08-events.yaml")));
  const sla = SlaSchema.parse(loadYaml(abs(modelDir, "09-sla.yaml")));

  const infrastructure = loadYaml<Record<string, any>>(abs(modelDir, "10-infrastructure.yaml")) ?? {};
  const relations = RelationsSchema.parse(loadYaml(abs(modelDir, "11-relations.yaml")));

  const runtime = RuntimeSchema.parse(loadYaml(abs(modelDir, "12-runtime.yaml")));
  const ownership = OwnershipSchema.parse(loadYaml(abs(modelDir, "13-ownership.yaml")));
  const roadmap = RoadmapSchema.parse(loadYaml(abs(modelDir, "14-roadmap.yaml")));

  return {
    vision,
    domains,
    capabilities,
    flows,
    components,
    services,
    apis,
    events,
    sla,
    infrastructure,
    relations,
    runtime,
    ownership,
    roadmap
  };
}
