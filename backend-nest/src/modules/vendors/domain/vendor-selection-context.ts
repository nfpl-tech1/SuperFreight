import { PortMode } from '../entities/port-master.entity';
import { VendorTypeCode } from '../entities/vendor-type-master.entity';

export enum VendorLocationKind {
  PORT = 'PORT',
  SERVICE_LOCATION = 'SERVICE_LOCATION',
}

export enum VendorLocationRole {
  ORIGIN = 'ORIGIN',
  DESTINATION = 'DESTINATION',
}

export enum VendorLocationScope {
  EXACT = 'EXACT',
  COUNTRY = 'COUNTRY',
}

export enum VendorQuoteTypeContext {
  ROAD_FREIGHT = 'road_freight',
  CHA_SERVICES = 'cha_services',
  OCEAN_FREIGHT = 'ocean_freight',
  AIR_FREIGHT = 'air_freight',
  LOCAL_PORT_CHARGES = 'local_port_charges',
  DESTINATION_CHARGES = 'destination_charges',
}

export type VendorSelectionContext = {
  locationKind: VendorLocationKind;
  portMode: PortMode | null;
  defaultTypeCodes: VendorTypeCode[];
};

function normalizeShipmentMode(shipmentMode?: string | null) {
  return shipmentMode?.trim().toUpperCase() ?? '';
}

export function resolveVendorSelectionContext(input: {
  quoteTypeContext?: string | null;
  shipmentMode?: string | null;
}): VendorSelectionContext {
  const shipmentMode = normalizeShipmentMode(input.shipmentMode);
  const isAirMode = shipmentMode === 'AIR';

  switch (input.quoteTypeContext) {
    case VendorQuoteTypeContext.ROAD_FREIGHT:
      return {
        locationKind: VendorLocationKind.SERVICE_LOCATION,
        portMode: null,
        defaultTypeCodes: [
          VendorTypeCode.TRANSPORTER,
          VendorTypeCode.CFS_BUFFER_YARD,
          VendorTypeCode.PACKER,
        ],
      };
    case VendorQuoteTypeContext.CHA_SERVICES:
      return {
        locationKind: VendorLocationKind.SERVICE_LOCATION,
        portMode: null,
        defaultTypeCodes: [VendorTypeCode.CHA, VendorTypeCode.LICENSING],
      };
    case VendorQuoteTypeContext.OCEAN_FREIGHT:
      return {
        locationKind: VendorLocationKind.PORT,
        portMode: PortMode.SEAPORT,
        defaultTypeCodes: [
          VendorTypeCode.SHIPPING_LINE,
          VendorTypeCode.CARRIER,
          VendorTypeCode.CO_LOADER,
        ],
      };
    case VendorQuoteTypeContext.AIR_FREIGHT:
      return {
        locationKind: VendorLocationKind.PORT,
        portMode: PortMode.AIRPORT,
        defaultTypeCodes: [
          VendorTypeCode.IATA,
          VendorTypeCode.CARRIER,
          VendorTypeCode.CO_LOADER,
        ],
      };
    case VendorQuoteTypeContext.LOCAL_PORT_CHARGES:
      return isAirMode
        ? {
            locationKind: VendorLocationKind.PORT,
            portMode: PortMode.AIRPORT,
            defaultTypeCodes: [
              VendorTypeCode.IATA,
              VendorTypeCode.CHA,
              VendorTypeCode.CARRIER,
            ],
          }
        : {
            locationKind: VendorLocationKind.PORT,
            portMode: PortMode.SEAPORT,
            defaultTypeCodes: [
              VendorTypeCode.CFS_BUFFER_YARD,
              VendorTypeCode.CHA,
              VendorTypeCode.SHIPPING_LINE,
              VendorTypeCode.CARRIER,
            ],
          };
    case VendorQuoteTypeContext.DESTINATION_CHARGES:
      return isAirMode
        ? {
            locationKind: VendorLocationKind.PORT,
            portMode: PortMode.AIRPORT,
            defaultTypeCodes: [
              VendorTypeCode.WCA_AGENT,
              VendorTypeCode.IATA,
              VendorTypeCode.CHA,
            ],
          }
        : {
            locationKind: VendorLocationKind.PORT,
            portMode: PortMode.SEAPORT,
            defaultTypeCodes: [
              VendorTypeCode.WCA_AGENT,
              VendorTypeCode.CHA,
              VendorTypeCode.CFS_BUFFER_YARD,
              VendorTypeCode.SHIPPING_LINE,
            ],
          };
    default:
      return {
        locationKind: VendorLocationKind.PORT,
        portMode: isAirMode ? PortMode.AIRPORT : PortMode.SEAPORT,
        defaultTypeCodes: [],
      };
  }
}

export function buildLegacyServiceLocationId(
  normalizedName: string,
  normalizedCountryName: string,
) {
  return `legacy:${normalizedName}::${normalizedCountryName}`;
}

export function parseLegacyServiceLocationId(value?: string | null) {
  if (!value?.startsWith('legacy:')) {
    return null;
  }

  const payload = value.slice('legacy:'.length);
  const [normalizedName, normalizedCountryName] = payload.split('::');
  if (!normalizedName || !normalizedCountryName) {
    return null;
  }

  return {
    normalizedName,
    normalizedCountryName,
  };
}
