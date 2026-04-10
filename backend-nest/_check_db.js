const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, user:'postgres', password:'2005', database:'FreightPriceEngine' });
c.connect().then(async () => {
  const cols = await c.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position");
  console.log('Columns:', cols.rows.map(x => x.column_name));
  const users = await c.query('SELECT * FROM users');
  console.log('Users:', JSON.stringify(users.rows, null, 2));
  await c.end();
}).catch(e => { console.error(e.message); process.exit(1); });
