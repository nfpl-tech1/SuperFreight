"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessMinimalPortMaster2026032701000 = void 0;
const migration_helpers_1 = require("../migration-helpers");
const RAW_PORT_ROWS = String.raw `Ho Chi Minh	Vietnam
Haiphong	Vietnam
Da Nang	Vietnam
Alexandria El Dekheila	Egypt
Alexandria Old Port	Egypt
Alexandria	Egypt
Port Said	Egypt
Damietta	Egypt
Sokhna	Egypt
Salvador	Brazil
Santos	Brazil
Paranagua	Brazil
Itajai/Navegantes	Brazil
Buenos Aires	Argentina
Montevideo	Uruguay
Pusan	South Korea
Kwangyang	South Korea
Incheon	South Korea
Colombo	Sri Lanka
Chittagong	Bangladesh
Male	Maldives
Singapore	Singapore
Port Klang	Malaysia
Penang	Malaysia
Pasir Gudang	Malaysia
Hong Kong	Hong Kong
Laem Chabang	Thailand
Lat Krabang	Thailand
Bangkok	Thailand
Jakarta	Indonesia
Surabaya	Indonesia
Belawan	Indonesia
Semarang	Indonesia
Ba Ria Vung Tau, (Cai Mep)	Vietnam
Kaohsiung	Taiwan
Keelung	Taiwan
Taichung	Taiwan
Chongqing	China
Da Chan Bay, Shenzhen, Guangdong	China
Dalian	China
Fuzhou(Mawei), Fujian	China
Huangpu, Guangdong	China
Jiangmen, Guangdong	China
Jiaoxin, Guangzhou, Guangdong	China
Lianhuashan, Guangzhou, Guangdong	China
Lianyungang, Jiangsu	China
Nanjing	China
Nansha	China
Nantong, Jiangsu	China
Ningbo	China
Qingdao	China
Qinzhou, Guangxi	China
Sanshui, Guangdong	China
Shanghai	China
Shantou, Guangdong	China
Shekou, Shenzhen	China
Weihai, Shandong	China
Wuhan, Hubei	China
Wuhu, Anhui	China
Xiamen, Fujian	China
Xingang, Tianjin	China
Yantian, Shenzhen	China
Yueyang, Hunan	China
Yunfu, Guangdong	China
Zhangjiagang, Jiangsu	China
Zhenjiang, Jiangsu	China
Hakata	Japan
Hamada	Japan
Hososhima	Japan
Kobe	Japan
Mizushima	Japan
Moji	Japan
Nagoya	Japan
Onahama	Japan
Osaka	Japan
Takamatsu	Japan
Tokyo	Japan
Yokohama	Japan
Manila North	Philippines
Manila South	Philippines
Los Angeles	USA
Long Beach	USA
Oakland	USA
Tacoma	USA
Vancouver	Canada
Montreal	Canada
Mombasa	Kenya
Dar Es Salaam	Tanzania
Zanzibar	Tanzania
Shekou	China
Da Chan Bay	China
Huangpu	China
Xiamen	China
Xingang	China
Jebel Ali	UAE
Sohar	Oman
Bahrain	Bahrain
Shuwaikh	Kuwait
Jeddah	Saudi Arabia
Ain Sokhna	Egypt
Hamad	Qatar
Abidjan	Ivory Coast
Sfax	Tunisia
Djibouti	Djibouti
Apapa	Nigeria
Manila	Philippines
Dammam	Saudi Arabia
Novorossiysk	Russia
Tema	Ghana
Casablanca	Morocco
Istanbul	Turkey
Aqaba	Jordan
Antwerp	Belgium
Yokkaichi	Japan
Cotonou	Benin
New York	USA
Savannah	USA
Fos sur Mer	France
Johannesburg	South Africa
Paramaribo	Suriname
Valencia	Spain
Walvis Bay	Namibia
Barcelona	Spain
Port Sudan	Sudan
King Abdullah Port	Saudi Arabia
Salalah	Oman
Umm Qasr	Iraq
Seattle	USA
Charleston	USA
Houston	USA
New Orleans	USA
Port Everglades	USA
Baltimore	USA
Philadelphia	USA
Boston	USA
Jacksonville	USA
Norfolk	USA
Rotterdam	Netherlands
Adelaide	Australia
Bell Bay	Australia
Brisbane	Australia
Melbourne	Australia
Fremantle	Australia
Sydney	Australia
Auckland	New Zealand
Bluff	New Zealand
Lyttleton	New Zealand
Napier	New Zealand
Nelson	New Zealand
Tauranga	New Zealand
Wellington	New Zealand
Noumea	New Caledonia
Lautoka	Fiji
Mogadishu	Somalia
Berbera	Somalia
Kismayu	Somalia
Aden	Yemen
Mukalla	Yemen
Banjul	Gambia
Conakry	Guinea
Dakar	Senegal
Douala	Cameroon
Freetown	Sierra Leone
Libreville	Gabon
Lobito	Angola
Lome	Togo
Luanda	Angola
Mindelo/Praia	Sao Vicente
Monrovia	Liberia
Namibe	Angola
Nouadhibou	Mauritania
Nouakchott	Mauritania
Onne	Nigeria
Port Harcourt	Nigeria
San-Pedro	Ivory Coast
Takoradi	Ghana
Matadi	Congo
Caacupemi Asuncion	Paraguay
Caacupemi Pilar	Pilar
Itapoa	Brazil
La Guaira - Euro	Venezuela
Manaus	Brazil
Navegantes	Brazil
Pecem	Brazil
Puerto Cabello - Euro	Venezuela
Rio De Janeiro	Brazil
Rio Grande	Brazil
Rosario	Argentina
Suape	Brazil
Vila Do Conde	Brazil
Zarate	Argentina
Arica	Chile
Buenaventura	Colombia
Callao	Peru
Cartagena	Colombia
Coronel	Chile
Guayaquil	Ecuador
Paita	Peru
San Antonio	Chile
Corinto	Nicaragua
Acajutla	El Salvador
Puerto Caldera	Costa Rica
Puerto Quetzal	Guatemala
Rodman	Panama
Puerto Cortes	Honduras
Moin	Costa Rica
Cristobal	Panama
PORT AU PRINCE	Caribbean
CAUCEDO	Caribbean
PORT OF SPAIN	Caribbean
RIO HAINA	Caribbean
KINGSTON	Caribbean
NASSAU	Caribbean
FREEPORT	Caribbean
BRIDGETOWN	Caribbean
GEORGETOWN	Caribbean
Montreal / Halifax	Canada
Toronto	Canada
Veracruz	Mexico
Altamira	Mexico
Manzanillo	Mexico
Lazaro Cardenas	Mexico
Agadir	Morocco
Algiers	Algeria
Annaba	Algeria
Bejaia	Algeria
Benghazi	Libya
Khoms	Libya
Nador	Morocco
Oran	Algeria
Skikda	Algeria
Tripoli	Lebanon
Tanga	Tanzania
Durban	South Africa
Cape Town	South Africa
Coega	South Africa
Port Louis	Mauritius
Majunga	Madagascar
Diego Suarez	Madagascar
Beira	Mozambique
Nacala	Mozambique
Maputo	Mozambique
Chattogram	Bangladesh
ICD Dhaka	Bangladesh
Trieste	Italy
Genoa	Italy
Livorno	Italy
Cagliari	Italy
Gioia Tauro	Italy
Ravenna	Italy
Venice	Italy
Messina	Italy
Augusta	Italy
Taranto	Italy
Napoli	Italy
La Spezia	Italy
Salerno	Italy
Savona	Italy
Nhava Sheva	India`;
const SEED_NOTE = 'Seeded from the approved minimal port master list.';
function cleanSeedValue(value) {
    return value.replace(/\s+/g, ' ').trim();
}
function normalizeSeedValue(value) {
    return cleanSeedValue(value)
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, ' ')
        .trim();
}
function buildMinimalPortSeeds() {
    const seen = new Map();
    for (const row of RAW_PORT_ROWS.split(/\r?\n/)) {
        const [nameRaw, countryRaw = ''] = row.split('\t');
        const name = cleanSeedValue(nameRaw || '');
        const country = cleanSeedValue(countryRaw || '');
        if (!name || !country) {
            continue;
        }
        const key = `${normalizeSeedValue(name)}::${normalizeSeedValue(country)}`;
        if (!seen.has(key)) {
            seen.set(key, { name, countryName: country });
        }
    }
    return Array.from(seen.values()).map((seed, index) => ({
        ...seed,
        code: `SEA-${String(index + 1).padStart(4, '0')}`,
        normalizedName: normalizeSeedValue(seed.name),
        normalizedCountryName: normalizeSeedValue(seed.countryName),
    }));
}
class BusinessMinimalPortMaster2026032701000 {
    name = 'BusinessMinimalPortMaster2026032701000';
    async up(queryRunner) {
        await (0, migration_helpers_1.createUuidExtension)(queryRunner);
        await (0, migration_helpers_1.createEnumTypeIfMissing)(queryRunner, 'port_master_portmode_enum', [
            'AIRPORT',
            'SEAPORT',
        ]);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "port_master" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "normalizedName" character varying,
        "cityName" character varying,
        "normalizedCityName" character varying,
        "stateName" character varying,
        "countryName" character varying NOT NULL,
        "normalizedCountryName" character varying,
        "portMode" "port_master_portmode_enum" NOT NULL,
        "regionId" uuid,
        "unlocode" character varying,
        "sourceConfidence" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_port_master_id" PRIMARY KEY ("id")
      )
    `);
        await (0, migration_helpers_1.addUniqueConstraintIfMissing)(queryRunner, 'port_master', 'UQ_port_master_portMode_code', ['portMode', 'code']);
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_port_master_name', 'port_master', '("name")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_port_master_country_city', 'port_master', '("countryName", "cityName")');
        await (0, migration_helpers_1.createIndexIfMissing)(queryRunner, 'IDX_port_master_portMode_isActive', 'port_master', '("portMode", "isActive")');
        const seedPorts = buildMinimalPortSeeds().map((port) => ({
            code: port.code,
            name: port.name,
            normalizedName: port.normalizedName,
            cityName: port.name,
            normalizedCityName: port.normalizedName,
            stateName: null,
            countryName: port.countryName,
            normalizedCountryName: port.normalizedCountryName,
            portMode: 'SEAPORT',
            regionId: null,
            unlocode: null,
            sourceConfidence: 'MANUAL_MINIMAL',
            isActive: true,
            notes: SEED_NOTE,
        }));
        for (let index = 0; index < seedPorts.length; index += 100) {
            await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into('port_master')
                .values(seedPorts.slice(index, index + 100))
                .orIgnore()
                .execute();
        }
    }
    async down(queryRunner) {
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_port_master_portMode_isActive');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_port_master_country_city');
        await (0, migration_helpers_1.dropIndexIfExists)(queryRunner, 'IDX_port_master_name');
        await (0, migration_helpers_1.dropConstraintIfExists)(queryRunner, 'port_master', 'UQ_port_master_portMode_code');
        await queryRunner.query(`DROP TABLE IF EXISTS "port_master"`);
        await (0, migration_helpers_1.dropEnumTypeIfExists)(queryRunner, 'port_master_portmode_enum');
    }
}
exports.BusinessMinimalPortMaster2026032701000 = BusinessMinimalPortMaster2026032701000;
//# sourceMappingURL=2026032701000-BusinessMinimalPortMaster.js.map