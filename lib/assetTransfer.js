/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                ProdID: 'asset1',
                Type: 'blue',
                HarvestDate: 5,
                Owner: 'Tomoko',
                Grade: 300,
            },
            {
                ProdID: 'asset1',
                Type: 'blue',
                HarvestDate: 5,
                Owner: 'Tomoko',
                Grade: 300,
            },
            {
                ProdID: 'asset1',
                Type: 'blue',
                HarvestDate: 5,
                Owner: 'Tomoko',
                Grade: 300,
            },
            {
                IProdID: 'asset1',
                Type: 'blue',
                HarvestDate: 5,
                Owner: 'Tomoko',
                Grade: 300,
            },
            {
                ProdID: 'asset1',
                Type: 'blue',
                HarvestDate: 5,
                Owner: 'Tomoko',
                Grade: 300,
            },
            {
                ProdID: 'asset1',
                Type: 'blue',
                HarvestDate: 5,
                Owner: 'Tomoko',
                Grade: 300,
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            await ctx.stub.putState(asset.ProdID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.ProdID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, prodId, type, harvestDate, owner, grade) {
        const asset = {
            ProdID: prodId,
            Type: type,
            HarvestDate:harvestDate,
            Owner: owner,
            Grade: grade,
        };
        await ctx.stub.putState(prodId, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, prodId) {
        const assetJSON = await ctx.stub.getState(prodId); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${prodId} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, prodId, type, harvestDate, owner, grade) {
        const exists = await this.AssetExists(ctx, prodId);
        if (!exists) {
            throw new Error(`The asset ${prodId} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ProdID: prodId,
            Type: type,
            HarvestDate:harvestDate,
            Owner: owner,
            Grade: grade,
        };
        return ctx.stub.putState(prodId, Buffer.from(JSON.stringify(updatedAsset)));
    }

    // DeleteAsset deletes a given asset from the world state.
    async DeleteAsset(ctx, prodId) {
        const exists = await this.AssetExists(ctx, prodId);
        if (!exists) {
            throw new Error(`The asset ${prodId} does not exist`);
        }
        return ctx.stub.deleteState(prodId);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, prodId) {
        const assetJSON = await ctx.stub.getState(prodId);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, prodId, newOwner) {
        const assetString = await this.ReadAsset(ctx, prodId);
        const asset = JSON.parse(assetString);
        asset.Owner = newOwner;
        return ctx.stub.putState(prodId, Buffer.from(JSON.stringify(asset)));
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
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


}

module.exports = AssetTransfer;
