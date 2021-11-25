import Client, { HTTP } from 'drand-client'
import fetch from '@web-std/fetch'
import AbortController from 'abort-controller'
import { Web3Storage, File } from 'web3.storage'
import * as Name from 'web3.storage/name'
import * as uint8arrays from 'uint8arrays'
import debug from 'debug'

const log = debug('drand-relay-w3s')

global.fetch = fetch
global.AbortController = AbortController

const chainHash = '8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce'
const urls = [
  'https://api.drand.sh',
  'https://api2.drand.sh',
  'https://api3.drand.sh'
]

async function main () {
  const { W3S_TOKEN, W3S_NAME_SIGNING_KEY } = process.env

  if (!W3S_TOKEN) throw new Error('missing W3S_TOKEN')
  if (!W3S_NAME_SIGNING_KEY) throw new Error('missing W3S_NAME_SIGNING_KEY')

  const w3Client = new Web3Storage({ token: W3S_TOKEN })
  const drandClient = await Client.wrap(HTTP.forURLs(urls, chainHash), { chainHash })

  const signingKey = uint8arrays.fromString(W3S_NAME_SIGNING_KEY, 'base64pad')
  const name = await Name.from(signingKey)

  let revision
  try {
    revision = await Name.resolve(w3Client, name)
    log(`🔍 resolved current revision: /ipns/${name} => ${revision.value}`)
  } catch (err) {
    log(`⚠️ failed to resolve ${name}:`, err)
  }

  for await (const rand of drandClient.watch()) {
    log(`🎲 received round: ${rand.round} randomness: ${rand.randomness} at: ${new Date().toISOString()}`)

    const data = JSON.stringify(rand)
    const filename = `${rand.round}.json`
    const cid = await w3Client.put([new File([data], filename)], { wrapWithDirectory: false })
    log(`💾 stored randomness round ${rand.round} at: ${cid}`)

    const value = `/ipfs/${cid}`
    revision = await (revision ? Name.increment(revision, value) : Name.v0(name, value))
    await Name.publish(w3Client, revision, name.key)
    log(`🆕 published revision: /ipns/${name} => /ipfs/${cid}`)
  }
}

main().catch(console.error)
