// Series of special configurations to be tested with `consensusSymulationtest.js`:

exports.configs = [
    //reason:
    {
        MAX_NODES: 5,
        SIMULATION_TIMEOUT: 4000,
        PULSE_PERIODICITY: 100,
        MAX_KEYS_COUNT: 100,
        MAX_TRANSACTIONS: 100,
        MAX_TRANSACTION_TIME: 500,
        NETWORK_DELAY: 500
    },

    //reason: sometime the output is `[STATISTICS]: { NUMBER_OF_TRANZACTIONS_PER_SEC: 0,  NUMBER_OF_PULSES: 84,  TIME_TO_COMMIT_TRANZACTION: Infinity }`
    //`consensusManager.js` LINE 61: `beat` outputs {ptBlock.length, this.vsd, majoritarianVSD} == {0, "empty", "empty"} for every node!
    {
        MAX_NODES: 10,
        SIMULATION_TIMEOUT: 4000,
        PULSE_PERIODICITY: 100,
        MAX_KEYS_COUNT: 100,
        MAX_TRANSACTIONS: 100,
        MAX_TRANSACTION_TIME: 500,
        NETWORK_DELAY: 200
    },

    //reason: same as above;
    //`beat` outputs {ptBlock.length, this.vsd, majoritarianVSD} == {0, "empty", "empty"}
    {
        MAX_NODES: 33,
        SIMULATION_TIMEOUT: 4000,
        PULSE_PERIODICITY: 50,
        MAX_KEYS_COUNT: 100,
        MAX_TRANSACTIONS: 1000,
        MAX_TRANSACTION_TIME: 300,
        NETWORK_DELAY: 300
    }

];
