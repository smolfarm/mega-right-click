#!/usr/bin/env node

/**
 * This file is where the command line hooks in.
 */

import { pullAllChains } from "./index.js"
import { ethers } from "ethers"

// Pull the parameters they passed out
const wallet = process.argv[2]
const apiKey = process.argv[3]

// Ensure the wallet parameter passed is valid
if(wallet && !ethers.isAddress(wallet)) {
    console.log("ERROR: Invalid wallet address!")
    process.exit(1)
}

pullAllChains(wallet, apiKey)