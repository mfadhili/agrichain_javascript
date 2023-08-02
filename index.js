/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const produceTransfer = require('./lib/produceTransfer');

module.exports.ProduceTransfer = produceTransfer;
module.exports.contracts = [produceTransfer];
