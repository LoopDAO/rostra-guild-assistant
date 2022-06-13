import { Get, Router } from '@discordx/koa'
import type { Context } from 'koa'
import { client } from '../main.js'
import { generateFlashsignerAddress, Config } from '@nervina-labs/flashsigner'
import NodeRsa from 'node-rsa'
import { Buffer } from 'buffer'
import db from '../database'
import { User } from '../shared/firestoreTypes'
import * as dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { GuildConfig, GuildRule } from '../shared/firestoreTypes'
import { getCotaCount } from '../service/cotaQuery'

dotenv.config()

const NERVINA_CHAIN_TYPE = process.env.NERVINA_CHAIN_TYPE == 'testnet' ? 'testnet' : 'mainnet'
export const DISCORD_VERIFICATION_SECRET =
    process.env.DISCORD_VERIFICATION_SECRET || 'secret'
console.log('DISCORD_VERIFICATION_SECRET: ',DISCORD_VERIFICATION_SECRET)

@Router()
export class API {
    @Get('/')
    index(context: Context) {
        context.body = `
      <div style="text-align: center">
        <h1>
          <a href="https://discord-ts.js.org">discord.ts</a> rest api server example
        </h1>
        <p>
          powered by <a href="https://koajs.com/">koa</a> and
          <a href="https://www.npmjs.com/package/@discordx/koa">@discordx/koa</a>
        </p>
      </div>
    `
    }

    @Get()
    guilds(context: Context) {
        context.body = `${client.guilds.cache.map((g) => `${g.id}: ${g.name}\n`)}`
    }

    @Get('/sign-success')
    async verifySig(context: Context) {
        const { flashsigner_data } = context.request.query
        const data = JSON.parse(flashsigner_data as string)
        const { message, sig: signature } = data.result
        const response = {
            message,
            signature: signature.slice(520),
            pubkey: signature.slice(0, 520)
        }
        const key = new NodeRsa()
        const buf = Buffer.from(response.pubkey, 'hex')
        const e = buf.slice(0, 4).reverse()
        const n = buf.slice(4).reverse()
        key.importKey({ e, n }, 'components-public')
        key.setOptions({ signingScheme: 'pkcs1-sha256' })
        const isSigValid = key.verify(
            Buffer.from(response.message),
            Buffer.from(response.signature, 'hex')
        )
        if (!isSigValid) {
            context.body = `Signature verified result: ${isSigValid}`
            console.log('Signature verification failed')
            return
        }
        Config.setChainType(NERVINA_CHAIN_TYPE)
        const address = generateFlashsignerAddress(response.pubkey)
        console.log('setChainType: ', NERVINA_CHAIN_TYPE, address)

        let decoded
        try {
            decoded = jwt.verify(
                message,
                DISCORD_VERIFICATION_SECRET
            ) as jwt.JwtPayload
        }
        catch (e) {
            console.error('JWT verification failed:', e)
            context.body = `Sign verification failed`
            return
        }
        const { userId, guildId } = decoded

        const user: User = {
            wallet: address,
            userId,
            guildId
        }

        const docKey = `${guildId}-${userId}`
        const userDoc = await db.collection('users').doc(docKey).get()
        if (userDoc.exists && userDoc.data()!.wallet === address) {
            console.log('User info already exists',address)
            context.body = `You already have this role`
            return
        }
        const guildConfigDoc = await db
            .collection('guildConfigs')
            .doc(guildId)
            .get()

        const guildConfigRules = (guildConfigDoc.data() as GuildConfig)?.rules
        console.log('guildConfigRules: ', guildConfigRules)
        const guild = await client.guilds.fetch(guildId)
        const member = await guild.members.fetch(userId)

        const { isqualified, rolename } = await isQualified(user.wallet, guildConfigRules)
        console.log('qualified: ', isqualified)

        if (isqualified) {

            const role = guild.roles.cache.find((el) => el.name == rolename)!
            try {
               console.log('Adding role: ', role.name)
               if(role)await member.roles.add(role)
                console.log('role added: ', rolename)
            } catch (err) {
                console.error('Error happened for adding role: ', err)
                return context.body = `Error happened for adding role: ${err}`
            }
            try {
                db.collection('users').doc(docKey).set(user)
                context.body = "link ckb wallet success!. You have been set to role "+rolename
            } catch (error) {
                console.error('Error happened for saving user info: ', error)
                return context.body = `Error happened for saving user info: ${error}`
            }
            return
        }
        console.log('User is not qualified ',user.wallet)
        context.body = `Current User has no NFT`
    }
}
async function isQualified(account: string, rules: any): Promise<{ isqualified: boolean; rolename: string }> {
    try {
        const condition = "and"
        console.log("condition...", condition)
        for (let i = 0;i < rules.length;i++) {
            const { nft } = rules[i]
            console.log("nft...", nft)
            const address = Object.keys(nft)[0]
            console.log("address...", address)

            const quantity = nft[address].quantity
            console.log("quantity...", quantity)
            const rs = await getCotaCount(account, address)
            console.log("rs...", rs)
            if (condition.toLowerCase() === "and") {
                if (!rs || rs < quantity) {
                    console.log(`"not qualified... index:${i}, nfts:${rs},quantity:${quantity}`)
                    return { isqualified: false, rolename: rules[i].roleName }
                }
                return { isqualified: true, rolename: rules[i].roleName }
            } else {
                if (rs && rs >= quantity) {
                    console.log(`"is qualified... index:${i}, nfts:${rs},quantity:${quantity}`)
                    return { isqualified: true, rolename: rules[i].roleName }
                }
            }
        }
    } catch (error) {
        console.error('Error happened for checking cota: ', error)
    }
    return { isqualified: false, rolename: "" }
}
function ChainType(arg0: string): string | undefined {
    throw new Error('Function not implemented.')
}

