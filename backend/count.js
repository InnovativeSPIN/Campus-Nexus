import initModels from './models/index.js';

async function count() {
  const { User, Faculty } = initModels();
  if (!User) {
    console.log("Models not loaded properly");
    process.exit(1);
  }
  const uc = await User.count();
  const fc = await Faculty.count();
  console.log(`Users: ${uc}, Faculty: ${fc}`);
  process.exit(0);
}

count();
