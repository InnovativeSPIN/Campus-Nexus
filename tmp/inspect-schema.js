import sequelize from '../backend/config/db.js';

(async () => {
  try {
    const [results] = await sequelize.query('SHOW COLUMNS FROM student_leaves');
    console.table(results.map(r => ({ Field: r.Field, Type: r.Type, Null: r.Null, Key: r.Key, Default: r.Default })));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
})();
