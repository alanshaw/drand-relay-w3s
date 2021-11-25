import * as Name from 'web3.storage/name'
import * as uint8arrays from 'uint8arrays'

async function main () {
  const name = await Name.create()
  console.log('')
  console.log('Signing key (base64 encoded):')
  console.log(uint8arrays.toString(name.key.bytes, 'base64pad'))
  console.log('')
  console.log('IPNS key ID:')
  console.log(name.toString())
}

main()
