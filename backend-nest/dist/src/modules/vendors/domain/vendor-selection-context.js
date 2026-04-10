"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorQuoteTypeContext = exports.VendorLocationScope = exports.VendorLocationRole = exports.VendorLocationKind = void 0;
exports.resolveVendorSelectionContext = resolveVendorSelectionContext;
exports.buildLegacyServiceLocationId = buildLegacyServiceLocationId;
exports.parseLegacyServiceLocationId = parseLegacyServiceLocationId;
const port_master_entity_1 = require("../entities/port-master.entity");
const vendor_type_master_entity_1 = require("../entities/vendor-type-master.entity");
var VendorLocationKind;
(function (VendorLocationKind) {
    VendorLocationKind["PORT"] = "PORT";
    VendorLocationKind["SERVICE_LOCATION"] = "SERVICE_LOCATION";
})(VendorLocationKind || (exports.VendorLocationKind = VendorLocationKind = {}));
var VendorLocationRole;
(function (VendorLocationRole) {
    VendorLocationRole["ORIGIN"] = "ORIGIN";
    VendorLocationRole["DESTINATION"] = "DESTINATION";
})(VendorLocationRole || (exports.VendorLocationRole = VendorLocationRole = {}));
var VendorLocationScope;
(function (VendorLocationScope) {
    VendorLocationScope["EXACT"] = "EXACT";
    VendorLocationScope["COUNTRY"] = "COUNTRY";
})(VendorLocationScope || (exports.VendorLocationScope = VendorLocationScope = {}));
var VendorQuoteTypeContext;
(function (VendorQuoteTypeContext) {
    VendorQuoteTypeContext["ROAD_FREIGHT"] = "road_freight";
    VendorQuoteTypeContext["CHA_SERVICES"] = "cha_services";
    VendorQuoteTypeContext["OCEAN_FREIGHT"] = "ocean_freight";
    VendorQuoteTypeContext["AIR_FREIGHT"] = "air_freight";
    VendorQuoteTypeContext["LOCAL_PORT_CHARGES"] = "local_port_charges";
    VendorQuoteTypeContext["DESTINATION_CHARGES"] = "destination_charges";
})(VendorQuoteTypeContext || (exports.VendorQuoteTypeContext = VendorQuoteTypeContext = {}));
function normalizeShipmentMode(shipmentMode) {
    return shipmentMode?.trim().toUpperCase() ?? '';
}
function resolveVendorSelectionContext(input) {
    const shipmentMode = normalizeShipmentMode(input.shipmentMode);
    const isAirMode = shipmentMode === 'AIR';
    switch (input.quoteTypeContext) {
        case VendorQuoteTypeContext.ROAD_FREIGHT:
            return {
                locationKind: VendorLocationKind.SERVICE_LOCATION,
                portMode: null,
                defaultTypeCodes: [
                    vendor_type_master_entity_1.VendorTypeCode.TRANSPORTER,
                    vendor_type_master_entity_1.VendorTypeCode.CFS_BUFFER_YARD,
                    vendor_type_master_entity_1.VendorTypeCode.PACKER,
                ],
            };
        case VendorQuoteTypeContext.CHA_SERVICES:
            return {
                locationKind: VendorLocationKind.SERVICE_LOCATION,
                portMode: null,
                defaultTypeCodes: [vendor_type_master_entity_1.VendorTypeCode.CHA, vendor_type_master_entity_1.VendorTypeCode.LICENSING],
            };
        case VendorQuoteTypeContext.OCEAN_FREIGHT:
            return {
                locationKind: VendorLocationKind.PORT,
                portMode: port_master_entity_1.PortMode.SEAPORT,
                defaultTypeCodes: [
                    vendor_type_master_entity_1.VendorTypeCode.SHIPPING_LINE,
                    vendor_type_master_entity_1.VendorTypeCode.CARRIER,
                    vendor_type_master_entity_1.VendorTypeCode.CO_LOADER,
                ],
            };
        case VendorQuoteTypeContext.AIR_FREIGHT:
            return {
                locationKind: VendorLocationKind.PORT,
                portMode: port_master_entity_1.PortMode.AIRPORT,
                defaultTypeCodes: [
                    vendor_type_master_entity_1.VendorTypeCode.IATA,
                    vendor_type_master_entity_1.VendorTypeCode.CARRIER,
                    vendor_type_master_entity_1.VendorTypeCode.CO_LOADER,
                ],
            };
        case VendorQuoteTypeContext.LOCAL_PORT_CHARGES:
            return isAirMode
                ? {
                    locationKind: VendorLocationKind.PORT,
                    portMode: port_master_entity_1.PortMode.AIRPORT,
                    defaultTypeCodes: [
                        vendor_type_master_entity_1.VendorTypeCode.IATA,
                        vendor_type_master_entity_1.VendorTypeCode.CHA,
                        vendor_type_master_entity_1.VendorTypeCode.CARRIER,
                    ],
                }
                : {
                    locationKind: VendorLocationKind.PORT,
                    portMode: port_master_entity_1.PortMode.SEAPORT,
                    defaultTypeCodes: [
                        vendor_type_master_entity_1.VendorTypeCode.CFS_BUFFER_YARD,
                        vendor_type_master_entity_1.VendorTypeCode.CHA,
                        vendor_type_master_entity_1.VendorTypeCode.SHIPPING_LINE,
                        vendor_type_master_entity_1.VendorTypeCode.CARRIER,
                    ],
                };
        case VendorQuoteTypeContext.DESTINATION_CHARGES:
            return isAirMode
                ? {
                    locationKind: VendorLocationKind.PORT,
                    portMode: port_master_entity_1.PortMode.AIRPORT,
                    defaultTypeCodes: [
                        vendor_type_master_entity_1.VendorTypeCode.WCA_AGENT,
                        vendor_type_master_entity_1.VendorTypeCode.IATA,
                        vendor_type_master_entity_1.VendorTypeCode.CHA,
                    ],
                }
                : {
                    locationKind: VendorLocationKind.PORT,
                    portMode: port_master_entity_1.PortMode.SEAPORT,
                    defaultTypeCodes: [
                        vendor_type_master_entity_1.VendorTypeCode.WCA_AGENT,
                        vendor_type_master_entity_1.VendorTypeCode.CHA,
                        vendor_type_master_entity_1.VendorTypeCode.CFS_BUFFER_YARD,
                        vendor_type_master_entity_1.VendorTypeCode.SHIPPING_LINE,
                    ],
                };
        default:
            return {
                locationKind: VendorLocationKind.PORT,
                portMode: isAirMode ? port_master_entity_1.PortMode.AIRPORT : port_master_entity_1.PortMode.SEAPORT,
                defaultTypeCodes: [],
            };
    }
}
function buildLegacyServiceLocationId(normalizedName, normalizedCountryName) {
    return `legacy:${normalizedName}::${normalizedCountryName}`;
}
function parseLegacyServiceLocationId(value) {
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
//# sourceMappingURL=vendor-selection-context.js.map