import { Aggregator } from '@nervina-labs/cota-sdk'

import pkg from '@nervosnetwork/ckb-sdk-utils'
const { addressToScript, serializeScript } = pkg

const service = {
    aggregator: new Aggregator({
        //registryUrl: 'http://cota-registry-aggregator.rostra.xyz',
        //cotaUrl: 'http://cota-aggregator.rostra.xyz',
        registryUrl: 'https://cota.nervina.dev/registry-aggregator',
        cotaUrl: 'https://cota.nervina.dev/aggregator'
    })
}

export const getCotaCount = async (account: string, contractAddress: string) => {
    const aggregator = service.aggregator
    const lockScript = serializeScript(addressToScript(account))
    const params = { lockScript, cotaId: contractAddress }
    const cotaCount = await aggregator.getCotaCount(params)

    return cotaCount?.count
}

