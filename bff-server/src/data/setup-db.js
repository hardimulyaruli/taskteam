require('dotenv').config();
const { query, connectDatabase } = require('../adapters/mysql');

async function setupDatabase() {
  await connectDatabase();
  console.log('Terhubung ke database MySQL.');

  console.log('\n--- 1. Menyesuaikan Struktur Tabel Users ---');
  const alters = [
    'ALTER TABLE users ADD COLUMN username VARCHAR(50)',
    'ALTER TABLE users ADD COLUMN role VARCHAR(50)',
    'ALTER TABLE users ADD COLUMN name VARCHAR(100)',
    'ALTER TABLE users ADD COLUMN password VARCHAR(255)'
  ];
  for (const sql of alters) {
    try {
      await query(sql);
      console.log(`Berhasil: ${sql}`);
    } catch (e) {
      // Abaikan error jika kolom sudah ada
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`Abaikan: Kolom sudah ada (${sql.split(' ').pop()})`);
      } else {
        console.log(`Abaikan: ${e.message}`);
      }
    }
  }

  console.log('\n--- 2. Memasukkan Demo Users ---');
  const users = [
    { id: 'u1-admin', username: 'admin', email: 'admin@taskteam.com', password: 'admin123', role: 'admin', name: 'Admin TaskTeam' },
    { id: 'u2-manager', username: 'manager', email: 'manager@taskteam.com', password: 'manager123', role: 'manager', name: 'Manager TaskTeam' },
    { id: 'u3-team', username: 'team', email: 'team@taskteam.com', password: 'team123', role: 'team', name: 'Team TaskTeam' },
    { id: 'u4-hanif', username: 'hanif', email: 'hanif@taskteam.com', password: 'hanif123', role: 'team', name: 'Hanif' },
    { id: 'u5-veliana', username: 'veliana', email: 'veliana@taskteam.com', password: 'veliana123', role: 'team', name: 'Veliana' },
  ];
  for (const u of users) {
    await query(
      `INSERT IGNORE INTO users (id, username, email, password_hash, password, role, name) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.username, u.email, u.password, u.password, u.role, u.name]
    );
  }
  console.log('Berhasil: 5 Demo users dimasukkan/diperbarui.');

  console.log('\n--- 3. Memasukkan Default Project ---');
  await query(`INSERT IGNORE INTO projects (id, name, description, manager_id) VALUES ('default-project', 'Default Project', 'Project default untuk TaskTeam', 'u1-admin')`);
  console.log('Berhasil: Default project disiapkan.');

  console.log('\n--- 4. Memasukkan Data Lookup (Status & Prioritas) ---');
  const lookups = [
    `INSERT IGNORE INTO task_statuses (id, name, order_index, color) VALUES ('s1-todo', 'To Do', 1, '#94A3B8')`,
    `INSERT IGNORE INTO task_statuses (id, name, order_index, color) VALUES ('s2-progress', 'Dikerjakan', 2, '#F97316')`,
    `INSERT IGNORE INTO task_statuses (id, name, order_index, color) VALUES ('s3-done', 'Selesai', 3, '#22C55E')`,
    `INSERT IGNORE INTO task_priorities (id, name, level, color) VALUES ('p1-low', 'Rendah', 1, '#22C55E')`,
    `INSERT IGNORE INTO task_priorities (id, name, level, color) VALUES ('p2-medium', 'Sedang', 2, '#F97316')`,
    `INSERT IGNORE INTO task_priorities (id, name, level, color) VALUES ('p3-high', 'Tinggi', 3, '#EF4444')`
  ];
  for (const sql of lookups) {
    await query(sql);
  }
  console.log('Berhasil: Lookup Task Status & Priority disiapkan.');

  console.log('\n✅ Setup Database Selesai! Anda siap untuk menggunakan aplikasi.');
  process.exit(0);
}

setupDatabase().catch(err => {
  console.error('\n❌ Gagal Setup Database:', err.message);
  process.exit(1);
});
