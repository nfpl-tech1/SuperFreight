const { Client } = require('pg');
const client = new Client({ user: 'postgres', password: '2005', host: 'localhost', port: 5432, database: 'logistics_business_core' });
client.connect()
  .then(() => client.query(\SELECT id, name, code, unlocode FROM port_master WHERE unlocode IN ('INNSA', 'INBOM') OR name ILIKE '%Mumbai%' OR name ILIKE '%Nhava%';\))
  .then(res => { console.dir(res.rows); process.exit(0); })
  .catch(console.error);
