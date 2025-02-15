/**
 * Functions used by mega right click
 */

import * as dotenv from "dotenv"
dotenv.config()

import axios from "axios"
import download from "image-downloader"
import fs from "fs"

const chains = ["ethereum", "base", "optimism", "matic", "arbitrum", "zora"]

const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY
const WALLET_ADDRESS = process.env.WALLET_ADDRESS

/**
 * Pulls all NFTs from the specified wallet on all chains
 * 
 * @param {string} wallet The wallet address to pull NFTs from
 * @param {string} apiKey The OpenSea API key to use
 */
export async function pullAllChains(wallet = WALLET_ADDRESS, apiKey = OPENSEA_API_KEY) {
    if(!wallet || wallet.trim() === "") {
        return
    }

    console.log(`Pulling all NFTs from ${wallet}`)

    // Ensure the output directory exists
    if(!fs.existsSync(`${process.cwd()}/images`)) {
        fs.mkdirSync(`${process.cwd()}/images`)
    }

    for(let chain of chains) {
        console.log(`Switching to chain: ${chain}`)

        await pullNFTImagesFromChain(chain, wallet, apiKey)
    }
}

/**
 * Pulls all NFTs from the specified wallet on the specified chain
 * 
 * @param {string} chain The chain to pull NFTs from
 * @param {string} wallet The wallet address to pull NFTs from
 * @param {string} apiKey The OpenSea API key to use
 */
export async function pullNFTImagesFromChain(chain, wallet = WALLET_ADDRESS, apiKey = OPENSEA_API_KEY) {
    // Ensure the output directory exists
    if(!fs.existsSync(`${process.cwd()}/images`)) {
        fs.mkdirSync(`${process.cwd()}/images`)
    }

    const nftURL = `https://api.opensea.io/api/v2/chain/${chain}/account/${wallet}/nfts?limit=200`

    let response = await axios.get(nftURL, {
        headers: {
            "X-API-KEY": apiKey
        }
    })

    while(response.data.nfts.length > 0) {
        for(let nft of response.data.nfts) {
            console.log(`Pulling ${nft.name}`)

            // Avoid things that don't work as filenames
            const name = nft.name.replace(/\./g, "").replace(/\//g, "").replace(/"/g, "")

            // Some images wind up unpinned from IPFS or otherwise unavailable, which will cause download.image to fail
            try {
                await download.image({
                    url: nft.image_url,
                    dest: `${process.cwd()}/images/${name}.png`
                })
            } catch(e) {
                console.log(`Error downloading ${nft.name}`)
            }
        }

        if(!response.data.next || response.data.next === "") {
            break
        } else {
            // Pull our next batch of NFTs
            response = await axios.get(nftURL + "&next=" + response.data.next, {
                headers: {
                    "X-API-KEY": apiKey
                }
            })
        }
        
    }
}
