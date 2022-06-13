import type { CommandInteraction, GuildMember, Role, User } from "discord.js"
import { MessageAttachment } from "discord.js"
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx"
import db from "../database"
import { GuildConfig, GuildRule } from "../shared/firestoreTypes"
import { guildRuleToSimpleRule } from "../utils/guildRuleHelpers"
import * as dotenv from "dotenv"

dotenv.config()

const BOT_ROLE = process.env.BOT_ROLE
console.log('guild setup command BOT_ROLE: ', BOT_ROLE)

const slashGroupName = "guild-setup"

@Discord()
@SlashGroup({ name: slashGroupName })
export abstract class GuildSetup {
    @Slash("add-nft-rule")
    @SlashGroup({ name: slashGroupName })
    async addNFTRule(
        @SlashOption("nft-address", {
            description: "The contract address against which to check for nft ownership for this rule."
        }) nftAddress: string,
        @SlashOption("quantity", {
            description: "The quantity of matching nfts that a user must hold in order to meet the rule."
        }) quantity: number,
        @SlashOption("role", {
            description: "The role to give to users which meet this rule.",
            type: "MENTIONABLE"
        }) role: Role,
        interaction: CommandInteraction
    ): Promise<void> {

        // configure the server settings
        // const nftAddress = interaction.options.getString("nft-address");
        // const role = interaction.options.getRole("role");
        //const rawQuantity = interaction.options.getNumber("quantity");

        // verify that nftAddress and role are defined
        if (!nftAddress || !role) {
            await interaction.reply({
                content: "Could not get nftAddress or role",
                ephemeral: true,
            })
            return
        }
        if (!quantity || quantity <= 0) {
            await interaction.reply({
                content: "Could not get quantity",
                ephemeral: true,
            })
            return
        }
        // const quantity = rawQuantity ? rawQuantity : 1;

        // check if the bot role is above the verified role
        const botRole = interaction?.guild?.roles.cache.find(
            (role) => role.name == BOT_ROLE
        )!

        if (role?.position > botRole?.position) {
            await interaction.reply({
                content: `Please update the role hierarchy with 'Rostra-Guild-Assistant' above of ${role.name} and try again.`,
                ephemeral: true,
            })
            return
        }
        console.log("role:", role)
        const newRule: GuildRule = {
            version: "1.0",
            nft: {
                [nftAddress]: {
                    // only include tokenIds if defined
                    quantity,
                },
            },
            udt: {},  // user defined token
            nativeToken: {},
            roleName: role.name ?? BOT_ROLE,
        }

        const guildConfigDoc = await db
            .collection("guildConfigs")
            .doc(interaction.guildId)
            .get()

        const guildConfig: GuildConfig = guildConfigDoc.exists
            ? (guildConfigDoc.data() as GuildConfig)
            : { rules: [] }

        console.log("newRule:", newRule)

        const result = guildConfig.rules.push(newRule)
        if (result <= 0) {
            await interaction.reply({
                content: "Could not add rule",
                ephemeral: true,
            })
            return
        }
        // update the db
        await db
            .collection("guildConfigs")
            .doc(interaction.guildId)
            .set(guildConfig)

        // reply
        await interaction.reply({
            content: "Rule added successfully!",
            ephemeral: true,
        })
    }

    @Slash("add-udt-rule")
    @SlashGroup({ name: slashGroupName })
    async addUDTRule(
        @SlashOption("udt-address", {
            description: "The contract address against which to check for udt ownership for this rule."
        }) udtAddress: string,
        @SlashOption("quantity", {
            description: "The quantity of matching nfts that a user must hold in order to meet the rule."
        }) quantity: number,
        @SlashOption("role", {
            description: "The role to give to users which meet this rule.",
            type: "MENTIONABLE"
        }) role: Role,
        interaction: CommandInteraction
    ): Promise<void> {
        // configure the server settings
        // const udtAddress = interaction.options.getString("udt-address");
        // const role = interaction.options.getRole("role");
        // const rawQuantity = interaction.options.getNumber("quantity");

        // verify that nftAddress and role are defined
        if (!udtAddress || !role) {
            await interaction.reply({
                content: "Could not get udtAddress or role",
                ephemeral: true,
            })
            return
        }

        // const quantity = rawQuantity ? rawQuantity : 1;

        // check if the bot role is above the verified role
        const botRole = interaction?.guild?.roles.cache.find(
            (role) => role.name == BOT_ROLE
        )!

        if (role.position > botRole.position) {
            await interaction.reply({
                content: `Please update the role hierarchy with ${BOT_ROLE} above of ${role.name} and try again.`,
                ephemeral: true,
            })
            return
        }

        const newRule: GuildRule = {
            version: "1.0",
            nft: {},
            udt: {
                [udtAddress]: {
                    quantity,
                },
            },
            nativeToken: {},
            roleName: role.name ?? BOT_ROLE,
        }

        const guildConfigDoc = await db
            .collection("guildConfigs")
            .doc(interaction.guildId)
            .get()

        const guildConfig: GuildConfig = guildConfigDoc.exists
            ? (guildConfigDoc.data() as GuildConfig)
            : { rules: [] }

        guildConfig.rules.push(newRule)

        // update the db
        await db
            .collection("guildConfigs")
            .doc(interaction.guildId)
            .set(guildConfig)

        // reply
        await interaction.reply({
            content: "Rule added successfully!",
            ephemeral: true,
        })
    }

    @Slash("view-rules")
    @SlashGroup({ name: slashGroupName })
    async viewRules(
        interaction: CommandInteraction
    ): Promise<void> {
        const guildConfigDoc = await db
            .collection("guildConfigs")
            .doc(interaction.guildId)
            .get()

        if (!guildConfigDoc.exists) {
            await interaction.reply({
                content:
                    "You haven't created any rules yet. Please run `/add-nft-rule` and try again",
                ephemeral: true,
            })
            return
        }

        const guildConfigRules = (guildConfigDoc.data() as GuildConfig).rules

        const res: any = {}

        guildConfigRules.forEach((guildRule, index) => {
            try {
                const simpleRule = guildRuleToSimpleRule(guildRule)

                res[`rule-${index}`] = simpleRule
                // return `Rule ${index}: ${JSON.stringify(ruleDisplay)}\n`;
            } catch (err) {
                res[`rule-${index}`] = guildRule
            }
        })

        // reply with list of configured rules
        await interaction.reply({
            content: "Your configured rules are attached!",
            ephemeral: true,
            files: [
                new MessageAttachment(
                    Buffer.from(JSON.stringify(res, null, 4)),
                    `bot-rules.txt`
                ),
            ],
        })
    }

    @Slash("remove-rule")
    @SlashGroup({ name: slashGroupName })
    async removeRule(
        @SlashOption("rule-number", {
            description: "Remove a rule based on its index in the output of `/list-rules`"
        }) ruleNumber: number,
        interaction: CommandInteraction
    ): Promise<void> {
        // const ruleNumber = interaction.options.getNumber("rule-number");

        if (ruleNumber == undefined) {
            await interaction.reply({
                content: "Please specify a rule number and try again",
                ephemeral: true,
            })
            return
        }

        const guildConfigDoc = await db
            .collection("guildConfigs")
            .doc(interaction.guildId)
            .get()

        if (!guildConfigDoc.exists) {
            await interaction.reply({
                content:
                    "You haven't created any rules yet. Please run `/rule-add` and try again",
                ephemeral: true,
            })
            return
        }

        // configure guild config
        const guildConfig = guildConfigDoc.data() as GuildConfig

        if (guildConfig.rules.length <= ruleNumber) {
            await interaction.reply({
                content: `Rule number is out of bounds. Please enter a rule number in the range 0-${guildConfig.rules.length - 1
                    }`,
                ephemeral: true,
            })
            return
        }

        guildConfig.rules.splice(ruleNumber, 1)

        // update the db
        await db
            .collection("guildConfigs")
            .doc(interaction.guildId)
            .set(guildConfig)

        // reply
        await interaction.reply({
            content: "Rule removed successfully!",
            ephemeral: true,
        })
    }


}
