import { Op } from 'sequelize';
import { models, sequelize } from '../models/index.js';

const { Role, User } = models;
const email = process.env.SECRETARY_EMAIL?.trim().toLowerCase();
const password = process.env.SECRETARY_PASSWORD;

if (!email || !password) throw new Error('SECRETARY_EMAIL and SECRETARY_PASSWORD must be provided');

const transaction = await sequelize.transaction();
try {
  let role = await Role.findOne({ where: { role_name: 'secretary' }, transaction, lock: transaction.LOCK.UPDATE });
  let roleCreated = false;
  if (!role) {
    const maxRole = await Role.max('role_id', { transaction });
    role = await Role.create({ role_id: Number(maxRole || 0) + 1, role_name: 'secretary' }, { transaction });
    roleCreated = true;
  }
  const users = await User.findAll({ where: { email: { [Op.eq]: email } }, transaction, lock: transaction.LOCK.UPDATE });
  if (users.length > 1) throw new Error(`Expected at most one Secretary user, found ${users.length}`);
  let user = users[0];
  let userCreated = false;
  if (!user) {
    user = await User.create({ name: 'Secretary', email, password, role_id: role.role_id, isActive: true }, { transaction });
    userCreated = true;
  } else {
    user.password = password;
    user.role_id = role.role_id;
    user.isActive = true;
    await user.save({ transaction });
  }
  await transaction.commit();
  const [roleCount, userCount] = await Promise.all([Role.count({ where: { role_name: 'secretary' } }), User.count({ where: { email } })]);
  if (roleCount !== 1 || userCount !== 1) throw new Error(`Verification failed: secretary roles=${roleCount}, users=${userCount}`);
  console.log(JSON.stringify({ role: { role_id: role.role_id, created: roleCreated, count: roleCount }, user: { id: user.id, email: user.email, role_id: user.role_id, isActive: user.isActive, created: userCreated, count: userCount } }, null, 2));
} catch (error) {
  await transaction.rollback();
  throw error;
} finally {
  await sequelize.close();
}
