import { test as base, expect } from '@playwright/test';
import { DbClient } from '../../utils/db-client';

type WorkerFixtures = {
    /** Kết nối Oracle dùng chung cho cả worker: mở pool một lần, tự đóng khi worker kết thúc. */
    db: DbClient;
};

export const test = base.extend<object, WorkerFixtures>({
    db: [
        async ({}, use) => {
            const db = new DbClient();
            await db.init();
            await use(db);
            await db.close();
        },
        { scope: 'worker' },
    ],
});

export { expect };
