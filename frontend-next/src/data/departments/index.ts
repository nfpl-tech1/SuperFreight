import type { DepartmentDefinition } from "@/types/rfq";
import { airFreight } from "./airFreight";
import { chaServices } from "./chaServices";
import { destinationCharges } from "./destinationCharges";
import { localPortCharges } from "./localPortCharges";
import { oceanFreight } from "./oceanFreight";
import { roadFreight } from "./roadFreight";
import { overseasAgents } from "./overseasAgents";

export const departments: DepartmentDefinition[] = [
    airFreight,
    oceanFreight,
    roadFreight,
    chaServices,
    localPortCharges,
    destinationCharges,
];
export {
    airFreight,
    chaServices,
    destinationCharges,
    localPortCharges,
    oceanFreight,
    overseasAgents,
    roadFreight,
};
