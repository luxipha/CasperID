describe('Casper deploy confirmation', () => {
    let waitForDeployExecution;

    beforeAll(() => {
        waitForDeployExecution = require('./casper').waitForDeployExecution;
    });

    test('returns only after a successful execution result', async () => {
        const getDeploy = jest
            .fn()
            .mockResolvedValueOnce([{}, { execution_results: [] }])
            .mockResolvedValueOnce([{}, {
                execution_results: [{ result: { Success: { effect: {} } } }]
            }]);

        await expect(waitForDeployExecution('deploy-1', {
            timeoutMs: 1000,
            pollIntervalMs: 0,
            getDeploy,
            sleep: jest.fn().mockResolvedValue(undefined)
        })).resolves.toBe('deploy-1');
        expect(getDeploy).toHaveBeenCalledTimes(2);
    });

    test('rejects a failed execution result', async () => {
        const getDeploy = jest.fn().mockResolvedValue([{}, {
            execution_results: [{ result: { Failure: { error_message: 'contract reverted' } } }]
        }]);

        await expect(waitForDeployExecution('deploy-2', { getDeploy }))
            .rejects.toMatchObject({ code: 'CASPER_DEPLOY_FAILED', deployHash: 'deploy-2' });
    });

    test('rejects when confirmation times out', async () => {
        await expect(waitForDeployExecution('deploy-3', {
            timeoutMs: 0,
            getDeploy: jest.fn()
        })).rejects.toMatchObject({ code: 'CASPER_DEPLOY_TIMEOUT', deployHash: 'deploy-3' });
    });
});
