import { Guild } from 'discord.js'
import * as dotenv from 'dotenv'
import { client } from '../main'
import fetch from "node-fetch"

dotenv.config()

console.log('BOT_MANAGER_ROLE: ', process.env.BOT_MANAGER_ROLE)
export default async (guild: Guild) => {
    await client.initApplicationCommands({
        guild: { log: true },
        global: { log: true }
    })
    console.log("setupPermissions: ", guild.name)

    let found = 0
    guild.channels.cache.map((channel) => {
        if (found === 0) {
            if (channel.type === "GUILD_TEXT") {
                channel.send(`Hello - I'm a Bot!`)

                found = 1

            }
        }
    })

    // Check if an existing Rostra commander role exists in the server
    const existingManagerRole = guild.roles.cache.find(
        (role) => role.name === process.env.BOT_MANAGER_ROLE
    )

    // console.log('existingManagerRole: ', existingManagerRole)
    // If no such role exists, create it
    let managerRole = undefined
    if (!existingManagerRole) {
        try {
            managerRole = await guild.roles.create({
                name: process.env.BOT_MANAGER_ROLE,
                color: 'BLUE',
                mentionable: true,
                reason: 'Managing the guild assistant.'
            })
            console.log('newManagerRole: ', managerRole)
        } catch (error) {
            console.error('newManagerRole error: ', guild.name, error)
            return
        }
    } else {
        //console.log('existingManagerRole: ', existingManagerRole)
        managerRole = existingManagerRole
    }

    // add command permission
    // await configureCommand!.permissions.add({ permissions })
}
