### 1 Create .env：
```
BOT_TOKEN=OTgzOTkyODM1MDQyODU3OTgw.GIHsrC.sFfejO88t1ISIRw1AKU8A6XVsX6smVnq7gK1Z8
BOT_MANAGER_ROLE=bot_manager_role
BOT_ROLE=bot_role
DISCORD_VERIFICATION_SECRET=OTcyODQ5NDUyNTUxMzg5MjE0

#development, production
ENVIRONMENT=development

WALLET_SIGN_REDIRECT_URL=http://localhost:3000/sign-success

#testnet,mainnet
NERVINA_CHAIN_TYPE=testnet
```
### 2.Get BOT_TOKEN：https://discord.com/developers/applications
- a. New Application
![C824CC3A-7E7F-47CF-9FBE-C3C7A0D8B3F3](https://user-images.githubusercontent.com/3693411/172654229-79ecee70-2b49-4d94-a8bc-81734d588ca9.png)

- b. Create App，
![561C3865-3341-4B17-9E21-0AD382679E12](https://user-images.githubusercontent.com/3693411/172654279-d24ddda0-2d27-44ed-8824-d568e6d9434f.png)


- c. Create Bot
  ![9643C218-6F2A-487E-BC10-D9A1ED8BD7A7](https://user-images.githubusercontent.com/3693411/172654312-1d779ac1-ef6c-4c4b-8208-5c726ee251f3.png)

- d.Reset TOKEN
  ![59DA52C8-CB10-4197-A40A-AC54BB406B1C](https://user-images.githubusercontent.com/3693411/172654347-07680f4c-7229-4a34-801c-e6af273eaa69.png)

- e.Privileged Gateway Intents



### 3.邀请 bot 加入自己的group,OAuth2 -》URL Generator -》copy。
    设置需要赋予bot的基本权限，然后通过copy获得邀请url，通过浏览器访问该url即可邀请bot进到自己的群组。

![41452008-3083-4113-A798-147781C925A5](https://user-images.githubusercontent.com/3693411/172654530-f7b2dd2f-4d6e-4bb3-8f68-47b42871711e.png)
![84CE5190-80A9-4797-AEA8-531A4870E011](https://user-images.githubusercontent.com/3693411/172654582-96f3f9c9-7c5e-4f2c-a4ec-68732292d359.png)

![B0BE937B-E9EE-4963-902E-DC6D04DAC9EB](https://user-images.githubusercontent.com/3693411/172654626-768173ce-6cd4-476b-8c57-6749b69bf264.png)


### 4.启动程序 yarn start
<img width="997" alt="C54F1D48-73E5-449C-BB97-DEB59523FB1D" src="https://user-images.githubusercontent.com/3693411/172654747-4dfb4b3f-a10f-4b47-9531-e6f0c01427a4.png">


### 5 使用NFT相关命令：
![F5737BA1-E9A0-4D36-882D-2781CF02F8F4](https://user-images.githubusercontent.com/3693411/172654801-cd81876e-e197-4b4e-8e99-9ba1ae924788.png)
