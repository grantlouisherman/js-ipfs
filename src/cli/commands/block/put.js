'use strict'

const bl = require('bl')
const fs = require('fs')
const multibase = require('multibase')
const promisify = require('promisify-es6')
const { print } = require('../../utils')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'put [block]',

  describe: 'Stores input as an IPFS block',

  builder: {
    format: {
      alias: 'f',
      describe: 'cid format for blocks to be created with.',
      default: 'dag-pb'
    },
    mhtype: {
      describe: 'multihash hash function',
      default: 'sha2-256'
    },
    mhlen: {
      describe: 'multihash hash length',
      default: undefined
    },
    version: {
      describe: 'cid version',
      type: 'number'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    },
    pin: {
      describe: 'Allows you to add pin to data',
      type: 'boolean',
      default:false
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      let data
      console.log("ARGS", argv.pin)
      if (argv.block) {
        data = await promisify(fs.readFile)(argv.block)
      } else {
        data = await new Promise((resolve, reject) => {
          process.stdin.pipe(bl((err, input) => {
            if (err) return reject(err)
            resolve(input)
          }))
        })
      }

      const ipfs = await argv.getIpfs()
      const { cid } = await ipfs.block.put(data, argv)
      if(argv.pin){
        await ipfs.pin.add(cid)
      }
      print(cidToString(cid, { base: argv.cidBase }))
    })())
  }
}
