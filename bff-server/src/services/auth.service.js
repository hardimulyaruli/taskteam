const { query } = require('../adapters/mysql');
const { demoUsers } = require('../data/demo-data');

function isRecoverableDbError(error) {
  return ['ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR', 'ER_PARSE_ERROR'].includes(error.code);
}

function normalizeRole(role) {
  const value = String(role || 'team').toLowerCase();
  if (value === 'admin' || value === 'manager' || value === 'team') {
    return value;
  }

  return 'team';
}

function toPublicUser(rawUser) {
  return {
    id: rawUser.id,
    username: rawUser.username,
    name: rawUser.name,
    role: normalizeRole(rawUser.role),
  };
}

function fromDbUser(dbUser) {
  return {
    id: dbUser.id ?? dbUser.user_id ?? dbUser.username,
    username: dbUser.username,
    name: dbUser.name ?? dbUser.full_name ?? dbUser.username,
    role: dbUser.role,
    password: dbUser.password ?? dbUser.user_password ?? dbUser.pass ?? '',
  };
}

async function authenticateUser(username, password) {
  try {
    const rows = await query('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
    const dbUser = rows[0] ? fromDbUser(rows[0]) : null;

    if (dbUser) {
      if (dbUser.password !== password) {
        return null;
      }

      return toPublicUser(dbUser);
    }
  } catch (error) {
    if (!isRecoverableDbError(error)) {
      throw error;
    }
  }

  const demoUser = demoUsers.find((user) => user.username === username && user.password === password);
  return demoUser ? toPublicUser(demoUser) : null;
}

module.exports = {
  authenticateUser,
};
