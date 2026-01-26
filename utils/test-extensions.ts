import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
    toHaveDataArray(received: any) {
        const hasData = received && typeof received === 'object' && 'data' in received;
        if (!hasData) {
            return {
                message: () => `expected object to have property "data"`,
                pass: false,
            };
        }

        const isArray = Array.isArray(received.data);
        if (!isArray) {
            return {
                message: () => `expected property "data" to be be an array`,
                pass: false,
            };
        }

        return {
            message: () => `expected object not to have property "data" as an array`,
            pass: true,
        };
    },
});

declare global {
    namespace PlaywrightTest {
        interface Matchers<R> {
            toHaveDataArray(): R;
        }
    }
}
