import { pool, initDb } from '~/server/db';

export default defineNuxtPlugin(async () => {
  // Инициализируем базу данных при запуске
  await initDb();
  
  return {
    provide: {
      db: pool
    }
  };
});
