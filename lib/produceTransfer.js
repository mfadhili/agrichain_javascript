/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class ProduceTransfer extends Contract {

    async InitLedger(ctx) {
        const produces = [
            {
                ProdID: 'P0000',
                Type: 'Avocado',
                HarvestDate: 'JULY-23',
                Owner: 'Tomoko',
                Grade: 3,
            },
            {
                ProdID: 'P0001',
                Type: 'Maize',
                HarvestDate: 'JULY-23',
                Owner: 'Tomoko',
                Grade: 4,
            },
            {
                ProdID: 'P0003',
                Type: 'Coffee',
                HarvestDate: 'JULY-23',
                Owner: 'Tomoko',
                Grade: 1,
            },
            {
                IProdID: 'P0004',
                Type: 'Coffee',
                HarvestDate: 'JULY-23',
                Owner: 'Tomoko',
                Grade: 2,
            },
            {
                ProdID: 'P0005',
                Type: 'Mango',
                HarvestDate: 'JULY-23',
                Owner: 'Tomoko',
                Grade: 2,
            },
            {
                ProdID: 'P0006',
                Type: 'Milk',
                HarvestDate: 'JULY-23',
                Owner: 'Tomoko',
                Grade: 4,
            },
        ];

        for (const produce of produces) {
            produce.docType = 'produce';
            await ctx.stub.putState(produce.ProdID, Buffer.from(JSON.stringify(produce)));
            console.info(`Asset ${produce.ProdID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateProduce(ctx, prodId, type, harvestDate, owner, grade) {
        const produce = {
            ProdID: prodId,
            Type: type,
            HarvestDate:harvestDate,
            Owner: owner,
            Grade: grade,
        };
        await ctx.stub.putState(prodId, Buffer.from(JSON.stringify(produce)));
        return JSON.stringify(produce);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadProduce(ctx, prodId) {
        const produceJSON = await ctx.stub.getState(prodId); // get the asset from chaincode state
        if (!produceJSON || produceJSON.length === 0) {
            throw new Error(`The produce ${prodId} does not exist`);
        }
        return produceJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateProduce(ctx, prodId, type, harvestDate, owner, grade) {
        const exists = await this.ProduceExists(ctx, prodId);
        if (!exists) {
            throw new Error(`The produce ${prodId} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedProduce = {
            ProdID: prodId,
            Type: type,
            HarvestDate:harvestDate,
            Owner: owner,
            Grade: grade,
        };
        return ctx.stub.putState(prodId, Buffer.from(JSON.stringify(updatedProduce)));
    }

    // DeleteAsset deletes a given asset from the world state.
    async DeleteProduce(ctx, prodId) {
        const exists = await this.ProduceExists(ctx, prodId);
        if (!exists) {
            throw new Error(`The produce ${prodId} does not exist`);
        }
        return ctx.stub.deleteState(prodId);
    }

    // ProduceExists returns true when asset with given ID exists in world state.
    async ProduceExists(ctx, prodId) {
        const produceJSON = await ctx.stub.getState(prodId);
        return produceJSON && produceJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferProduce(ctx, prodId, newOwner) {
        const produceString = await this.ReadProduce(ctx, prodId);
        const produce = JSON.parse(produceString);
        produce.Owner = newOwner;
        return ctx.stub.putState(prodId, Buffer.from(JSON.stringify(produce)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllProduce(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // Get Produce history
    async GetProduceHistory(ctx, prodId) {
        let produceIterator = await ctx.stub.getHistoryForKey(prodId);
        let produceHistory = await this._GetAllProduce(produceIterator,true);

        return JSON.stringify(produceHistory);
    }

    async _GetAllProduce(produceIterator, isHistory) {
        let allResults = [];

        let res = await produceIterator.next();
        while (!res.done){
            if (res.value && res.value.value.toString()){
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if(isHistory & isHistory ===true){
                    jsonRes.TxId = res.value.txId;
                    jsonRes.TimeStamp = res.value.timestamp;

                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            res = await produceIterator.next();
        }
        produceIterator.close();
        return allResults;
    }
}

module.exports = ProduceTransfer;
