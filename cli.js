#!/usr/bin/env node

import { pullAllChains } from "./index.js"
import { ethers } from "ethers"

const wallet = process.argv[2]
const apiKey = process.argv[3]

if(!ethers.isAddress(wallet)) {
    console.log("ERROR: Invalid wallet address!")
    process.exit(1)
}

pullAllChains(wallet, apiKey)