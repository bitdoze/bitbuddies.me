I want to create a section in frontent and in admin area where I add the latest youtube videos from channels that I like from youtube. 
This needs to go and check every day the channel feed and add new videos in a database table and display them on a page for visirors.
It needs to have a filter also based on channel name and display the latest videos in order from all channel that I include.
This should display latest 12 videos with load more on the page

In admin are I want to add the channel id and have some stats with how many channels are there and videos.
The database should store the video detail like, title, description, image url, published,views as I want to use them to parse with AI later to have recommandations for new videos.
I want to have also a button to update the latest videos on a channel I choose if I want.

This should have a scheduler and run every day and add the latest videos.
Go adn see the currect implementation for workshops for instance to understand and implement this for me.
THe videos can be fetched with youtube feed that will be like below:

https://www.youtube.com/feeds/videos.xml?channel_id=UCGsUtKhXsRrMvYAWm8q0bCg
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
<link rel="self" href="http://www.youtube.com/feeds/videos.xml?channel_id=UCGsUtKhXsRrMvYAWm8q0bCg"/>
<id>yt:channel:GsUtKhXsRrMvYAWm8q0bCg</id>
<yt:channelId>GsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>WEBdoze</title>
<link rel="alternate" href="https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2013-10-04T07:20:28+00:00</published>
<entry>
<id>yt:video:w3NHf5vkMUk</id>
<yt:videoId>w3NHf5vkMUk</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>Run AI Tools Safely with Docker! (Amp, Factory AI, Gemini & More)</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=w3NHf5vkMUk"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-11-05T13:23:28+00:00</published>
<updated>2025-11-06T09:05:43+00:00</updated>
<media:group>
<media:title>Run AI Tools Safely with Docker! (Amp, Factory AI, Gemini & More)</media:title>
<media:content url="https://www.youtube.com/v/w3NHf5vkMUk?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i4.ytimg.com/vi/w3NHf5vkMUk/hqdefault.jpg" width="480" height="360"/>
<media:description>Want to safely run your AI CLI tools like Amp, Claude, Gemini & Factory AI without messing up your system? In this video I’ll show you how to use Docker to isolate and manage your AI agent environments easily and cleanly. 🐳 🔗 Get all the commands + article: https://www.bitdoze.com/docker-podman-ai-cli-tools-safe-environment/ 📌 Subscribe for more AI dev tips and Docker workflows.</media:description>
<media:community>
<media:starRating count="5" average="5.00" min="1" max="5"/>
<media:statistics views="42"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:K3O2Cjq6Iho</id>
<yt:videoId>K3O2Cjq6Iho</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>Host Your Database & App Like a Pro – PostgreSQL + TanStack on Dokploy!</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=K3O2Cjq6Iho"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-30T07:23:58+00:00</published>
<updated>2025-10-31T08:08:58+00:00</updated>
<media:group>
<media:title>Host Your Database & App Like a Pro – PostgreSQL + TanStack on Dokploy!</media:title>
<media:content url="https://www.youtube.com/v/K3O2Cjq6Iho?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i4.ytimg.com/vi/K3O2Cjq6Iho/hqdefault.jpg" width="480" height="360"/>
<media:description>Learn how to deploy a PostgreSQL database and host a TanStack Start app directly on Dokploy, the self-hosted PaaS that makes app management simple, secure, and affordable. In this step-by-step video, I’ll show you how to: ✅ Set up a PostgreSQL database in Dokploy ✅ Configure your TanStack Start app to connect to Postgres with Drizzle ✅ Deploy everything with HTTPS and environment variables ✅ Manage your app and database easily through the Dokploy dashboard Perfect for developers who want full control, no monthly hosting fees, and a clean setup for production-ready apps. 🔗 Useful Links: 👉 Bitdoze Article & Commands: https://www.bitdoze.com/tanstack-start-dokploy-deploy/</media:description>
<media:community>
<media:starRating count="10" average="5.00" min="1" max="5"/>
<media:statistics views="190"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:T7izljcBFeE</id>
<yt:videoId>T7izljcBFeE</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>Monitor Your Dokploy Server Like a Pro: Uptime Kuma + Beszel Setup!</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=T7izljcBFeE"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-29T08:15:21+00:00</published>
<updated>2025-10-31T12:09:37+00:00</updated>
<media:group>
<media:title>Monitor Your Dokploy Server Like a Pro: Uptime Kuma + Beszel Setup!</media:title>
<media:content url="https://www.youtube.com/v/T7izljcBFeE?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i1.ytimg.com/vi/T7izljcBFeE/hqdefault.jpg" width="480" height="360"/>
<media:description>Learn how to set up real-time monitoring for your Dokploy server using Uptime Kuma and Beszel, two powerful open-source tools that keep your apps under control. In this step-by-step tutorial, I’ll show you how to: ✅ Install Uptime Kuma inside Dokploy ✅ Connect Beszel for advanced server metrics and resource tracking ✅ Set up email notifications so you’ll instantly know if your apps go down ✅ Create uptime reports and dashboards Perfect for developers and self-hosters who want reliable monitoring without paying for expensive SaaS tools. 💡 Watch till the end for extra tips on improving server reliability and alerts automation. 📘 More Guides: https://www.bitdoze.com</media:description>
<media:community>
<media:starRating count="8" average="5.00" min="1" max="5"/>
<media:statistics views="220"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:uXv8feFCGGA</id>
<yt:videoId>uXv8feFCGGA</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>How to Setup A Dokploy Remote Server</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=uXv8feFCGGA"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-29T06:24:14+00:00</published>
<updated>2025-10-31T10:40:30+00:00</updated>
<media:group>
<media:title>How to Setup A Dokploy Remote Server</media:title>
<media:content url="https://www.youtube.com/v/uXv8feFCGGA?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i2.ytimg.com/vi/uXv8feFCGGA/hqdefault.jpg" width="480" height="360"/>
<media:description>See how you can set up a Dokploy remote server where you can use your Dokploy main install to manage the remote server. SSH key creation and setup for remote server. Article: https://www.bitdoze.com/dokploy-install/</media:description>
<media:community>
<media:starRating count="12" average="5.00" min="1" max="5"/>
<media:statistics views="226"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:c69fT4kx9IQ</id>
<yt:videoId>c69fT4kx9IQ</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>ASUS Master Thunderbolt 5 Dock DC510 Review: Real-World Testing & Performance</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=c69fT4kx9IQ"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-27T11:32:45+00:00</published>
<updated>2025-10-31T09:53:31+00:00</updated>
<media:group>
<media:title>ASUS Master Thunderbolt 5 Dock DC510 Review: Real-World Testing & Performance</media:title>
<media:content url="https://www.youtube.com/v/c69fT4kx9IQ?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i4.ytimg.com/vi/c69fT4kx9IQ/hqdefault.jpg" width="480" height="360"/>
<media:description>Check out how the ASUS Master Thunderbolt 5 Dock DC510 is doing in real world tests. I have paired this with M1 MacBook pro and M4 Mac Mini Pro with 2 4k monitors and a 2TB SSD. Article: https://www.bitdoze.com/asus-thunderbolt-5-dock-dc510-review/ DC510: https://go.bitdoze.com/asus-dc510 SSD: https://amzn.to/3WoV1vu Alternative: https://www.bitdoze.com/asus-vs-razer-thunderbolt-5-comparison/</media:description>
<media:community>
<media:starRating count="4" average="5.00" min="1" max="5"/>
<media:statistics views="174"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:QeCYko1TJQM</id>
<yt:videoId>QeCYko1TJQM</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>Stop Wasting Tokens! GLM 4.6 Coding Plan vs OpenRouter GLM Exacto 🔥</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=QeCYko1TJQM"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-27T07:25:15+00:00</published>
<updated>2025-10-31T11:40:33+00:00</updated>
<media:group>
<media:title>Stop Wasting Tokens! GLM 4.6 Coding Plan vs OpenRouter GLM Exacto 🔥</media:title>
<media:content url="https://www.youtube.com/v/QeCYko1TJQM?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i2.ytimg.com/vi/QeCYko1TJQM/hqdefault.jpg" width="480" height="360"/>
<media:description>Testing the new OpenRouter GLM4.6(exacto) to see how it does in comparation with the z.ai coding plans. GLM 4.6: https://z.ai/subscribe?ic=NKNUNYDRZT</media:description>
<media:community>
<media:starRating count="10" average="5.00" min="1" max="5"/>
<media:statistics views="456"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:EaOvNN-RJgI</id>
<yt:videoId>EaOvNN-RJgI</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>Host Your Own Apps Like a Pro! Dokploy Setup + VPS Security Guide</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=EaOvNN-RJgI"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-21T10:36:11+00:00</published>
<updated>2025-10-22T06:39:37+00:00</updated>
<media:group>
<media:title>Host Your Own Apps Like a Pro! Dokploy Setup + VPS Security Guide</media:title>
<media:content url="https://www.youtube.com/v/EaOvNN-RJgI?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i2.ytimg.com/vi/EaOvNN-RJgI/hqdefault.jpg" width="480" height="360"/>
<media:description>In this first episode of the Host Your Own Apps with Dokploy series, we’re setting up a secure VPS from scratch and deploying Dokploy — a self-hosted PaaS alternative that makes app hosting simple and powerful. You’ll learn how to: ✅ Create and secure a VPS server (SSH, sudo user, disable root login) ✅ Protect your server with CrowdSec ✅ Install and configure Dokploy ✅ Enable HTTPS for your hosted apps Perfect for developers who want full control, better security, and no monthly fees for managed hosting. 📘 Commands & Resources: https://www.bitdoze.com/dokploy-install/ 💬 Episode 2 → Coming Soon: Deploy your first app on Dokploy! Get 20 Euros on Hetzner: https://go.bitdoze.com/hetzner</media:description>
<media:community>
<media:starRating count="34" average="5.00" min="1" max="5"/>
<media:statistics views="1091"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:WB10h_fSkeE</id>
<yt:videoId>WB10h_fSkeE</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>I Switched to Copilot Pro + Zed — Here’s Why You Should Too</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=WB10h_fSkeE"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-20T13:13:24+00:00</published>
<updated>2025-10-21T19:50:33+00:00</updated>
<media:group>
<media:title>I Switched to Copilot Pro + Zed — Here’s Why You Should Too</media:title>
<media:content url="https://www.youtube.com/v/WB10h_fSkeE?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i4.ytimg.com/vi/WB10h_fSkeE/hqdefault.jpg" width="480" height="360"/>
<media:description>In this video I show the best AI combo I use for real development: GitHub Copilot Pro ($10/month), Zed IDE, and the Copilot CLI — plus when to use premium models like Claude Sonnet. I’ll walk you through setup, daily workflows, using unlimited GPT‑5 mini, saving your 300 premium requests, and practical tips to get more done faster. - Full article & walkthrough: https://www.bitdoze.com/github-copilot-complete-guide/</media:description>
<media:community>
<media:starRating count="13" average="5.00" min="1" max="5"/>
<media:statistics views="847"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:6LtxUE54Llw</id>
<yt:videoId>6LtxUE54Llw</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>I Tried the Ad-Supported AI Coding Agent (Amp Free)</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=6LtxUE54Llw"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-17T13:13:26+00:00</published>
<updated>2025-10-18T15:50:25+00:00</updated>
<media:group>
<media:title>I Tried the Ad-Supported AI Coding Agent (Amp Free)</media:title>
<media:content url="https://www.youtube.com/v/6LtxUE54Llw?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i3.ytimg.com/vi/6LtxUE54Llw/hqdefault.jpg" width="480" height="360"/>
<media:description>Meet Amp Code, the new AI coding agent from Sourcegraph that takes code assistance to the next level. Unlike regular autocomplete tools, Amp can actually understand your entire codebase, run commands, edit files, and even work autonomously on complex development tasks — directly in your CLI or IDE. In this video, I test out the Amp Free Mode (yes, it’s completely free but ad-supported 👀). You’ll see how it performs in real projects, what it can actually do, and whether the ads are a dealbreaker or just a funny new trend for devs in 2025. Article: https://www.bitdoze.com/amp-code-free-ai-coding-agent/</media:description>
<media:community>
<media:starRating count="9" average="5.00" min="1" max="5"/>
<media:statistics views="662"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:k6H4TmuHF4Q</id>
<yt:videoId>k6H4TmuHF4Q</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>Hetzner's NEW €3.49 VPS: Too Cheap to Be True? (Performance Test)</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=k6H4TmuHF4Q"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-17T10:20:50+00:00</published>
<updated>2025-10-18T08:50:03+00:00</updated>
<media:group>
<media:title>Hetzner's NEW €3.49 VPS: Too Cheap to Be True? (Performance Test)</media:title>
<media:content url="https://www.youtube.com/v/k6H4TmuHF4Q?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i4.ytimg.com/vi/k6H4TmuHF4Q/hqdefault.jpg" width="480" height="360"/>
<media:description>Hetzner just dropped their new Shared (Cost-Optimized) and Regular Performance VPS servers — and they are insanely affordable! 💸 Starting from only €3.49/month, these new plans bring incredible value for developers, small projects, and anyone looking to save on cloud hosting. In this video, I’ll break down: The differences between Shared vs Regular VPS Real-world benchmarks and performance tests How they compare to the previous Hetzner CX lineup Which one is the best choice for your use case in 2025 Whether you’re hosting websites, running Docker apps, or just want the best bang for your buck, this video will help you choose the right Hetzner plan. 💰 Get €20 Free Credit on Hetzner 👉 https://go.bitdoze.com/hetzner 📘 Read the Full Article & Comparison 👉 https://www.bitdoze.com/hetzner-cloud-cost-optimized-plans/</media:description>
<media:community>
<media:starRating count="15" average="5.00" min="1" max="5"/>
<media:statistics views="790"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:R6EVfD8k4Yw</id>
<yt:videoId>R6EVfD8k4Yw</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>Haiku 4.5 vs GPT-5 Mini vs Kimi K2 vs Grok Code Fast — AI Website Showdown!</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=R6EVfD8k4Yw"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-16T07:33:15+00:00</published>
<updated>2025-10-23T23:33:02+00:00</updated>
<media:group>
<media:title>Haiku 4.5 vs GPT-5 Mini vs Kimi K2 vs Grok Code Fast — AI Website Showdown!</media:title>
<media:content url="https://www.youtube.com/v/R6EVfD8k4Yw?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i3.ytimg.com/vi/R6EVfD8k4Yw/hqdefault.jpg" width="480" height="360"/>
<media:description>In this video, I put 4 powerful AI models head-to-head to see which one can build a website better and faster! We’re testing: 💻 Kimi K2 0905 ⚡ GPT-5 Mini 🚀 Grok Code Fast 🤖 Claude Haiku 4.5 Each AI gets the same web-building challenge, and we compare their speed, accuracy, code quality, and cost efficiency. Which AI will come out on top? Watch till the end to find out — the results might surprise you!</media:description>
<media:community>
<media:starRating count="14" average="5.00" min="1" max="5"/>
<media:statistics views="450"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:4sNy8jhJHeU</id>
<yt:videoId>4sNy8jhJHeU</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>Claude Haiku 4.5 Is HALF the Cost of Sonnet 4 – But Can It Still Code a Website?</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=4sNy8jhJHeU"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-15T18:31:37+00:00</published>
<updated>2025-10-16T07:53:53+00:00</updated>
<media:group>
<media:title>Claude Haiku 4.5 Is HALF the Cost of Sonnet 4 – But Can It Still Code a Website?</media:title>
<media:content url="https://www.youtube.com/v/4sNy8jhJHeU?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i1.ytimg.com/vi/4sNy8jhJHeU/hqdefault.jpg" width="480" height="360"/>
<media:description>Claude Haiku 4.5 has just been released by Anthropic, promising Sonnet-level intelligence at one-third the cost and twice the speed! In this video, I put it to the test — can this smaller, faster model actually build a full website and keep up with Claude Sonnet 4.5?</media:description>
<media:community>
<media:starRating count="17" average="5.00" min="1" max="5"/>
<media:statistics views="829"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:qNPbWRfNbSY</id>
<yt:videoId>qNPbWRfNbSY</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>20 FREE Tools You Need in 2025-2026 (AI, Hosting & Dev Goldmine)</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=qNPbWRfNbSY"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-15T08:08:18+00:00</published>
<updated>2025-11-05T08:33:26+00:00</updated>
<media:group>
<media:title>20 FREE Tools You Need in 2025-2026 (AI, Hosting & Dev Goldmine)</media:title>
<media:content url="https://www.youtube.com/v/qNPbWRfNbSY?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i2.ytimg.com/vi/qNPbWRfNbSY/hqdefault.jpg" width="480" height="360"/>
<media:description>In this video, I’ll show you the most useful and trending AI tools for 2025–2026 — from AI website builders and content creators to automation tools that will make your workflow 10x faster! These are the tools that everyone will be using next year — and most of them are completely free or have free plans. Whether you’re into AI productivity, content creation, coding, or marketing, this list has something for you. 👉 What You’ll Discover: The top AI tools for 2025–2026 you can use right now How to use AI assistants to boost productivity and creativity Free AI platforms that outperform paid ones The latest AI trends and predictions for 2026 🔗 Useful Links & Resources: https://www.bitdoze.com/resources/</media:description>
<media:community>
<media:starRating count="10" average="5.00" min="1" max="5"/>
<media:statistics views="271"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:JoeInjyhMo8</id>
<yt:videoId>JoeInjyhMo8</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>How I Got GPT-5 & Claude 4.5 Access for $0 — 40M Tokens + $200 API Credit!</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=JoeInjyhMo8"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-10T08:48:28+00:00</published>
<updated>2025-10-13T21:37:14+00:00</updated>
<media:group>
<media:title>How I Got GPT-5 & Claude 4.5 Access for $0 — 40M Tokens + $200 API Credit!</media:title>
<media:content url="https://www.youtube.com/v/JoeInjyhMo8?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i3.ytimg.com/vi/JoeInjyhMo8/hqdefault.jpg" width="480" height="360"/>
<media:description>Want to use Claude Sonnet 4.5 or GPT-5 for FREE? In this video, I’ll show you 3 legit ways to get access to advanced AI models without paying a cent! You’ll learn how to: ✅ Get $200 in free API credits to test GPT-5 and Claude 4.5 ✅ Use a CLI tool with 40 million free tokens for coding and automation ✅ Try a powerful AI IDE with 25 free prompts monthly for development and content creation 💡 These are the exact tools I use to build, code, and create with AI — totally free to start! 🔗 Useful Links Mentioned in the Video: 👉 $200 Free API Credits – https://go.bitdoze.com/agentrouter 👉 Free 40 Million Tokens – https://go.bitdoze.com/droid-cli 👉 Free 25 Prompts Monthly – https://go.bitdoze.com/windsurf Comment below which one worked best for you or if you found another free way to use GPT-5 or Claude 4.5! 📘 Full guide on my blog: https://www.bitdoze.com/use-claude-sonnet-4-5-gpt-5-free/</media:description>
<media:community>
<media:starRating count="153" average="5.00" min="1" max="5"/>
<media:statistics views="10036"/>
</media:community>
</media:group>
</entry>
<entry>
<id>yt:video:Y2EZzZKxZdQ</id>
<yt:videoId>Y2EZzZKxZdQ</yt:videoId>
<yt:channelId>UCGsUtKhXsRrMvYAWm8q0bCg</yt:channelId>
<title>How I Gave My AI Real-Time Access to Amazon & LinkedIn</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=Y2EZzZKxZdQ"/>
<author>
<name>WEBdoze</name>
<uri>https://www.youtube.com/channel/UCGsUtKhXsRrMvYAWm8q0bCg</uri>
</author>
<published>2025-10-07T07:05:18+00:00</published>
<updated>2025-10-08T07:27:01+00:00</updated>
<media:group>
<media:title>How I Gave My AI Real-Time Access to Amazon & LinkedIn</media:title>
<media:content url="https://www.youtube.com/v/Y2EZzZKxZdQ?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
<media:thumbnail url="https://i2.ytimg.com/vi/Y2EZzZKxZdQ/hqdefault.jpg" width="480" height="360"/>
<media:description>In this video, I’ll show you step-by-step how I set up BrightData MCP, installed Droid CLI, and connected everything inside my IDE (Zed) for a smooth AI-powered workflow. You’ll learn how to: ✅ Create and configure your BrightData MCP account (get $10 FREE credits) ✅ Install and set up Droid CLI with 40 million FREE tokens ✅ Add the MCP integration directly into your Droid CLI or IDE like Zed for faster coding and AI assistance ✅ Test the setup with real use-cases for coding and automation 💡 This combo gives you powerful AI tools locally — free or almost free! 🔗 Useful Links: 📘 Full Guide Article: https://www.bitdoze.com/brightdata-mcp-guide/ 💰 BrightData MCP ($10 Free Credits): https://go.bitdoze.com/brightdata 🤖 Droid CLI (40M Free Tokens): https://go.bitdoze.com/droid-cli</media:description>
<media:community>
<media:starRating count="6" average="5.00" min="1" max="5"/>
<media:statistics views="157"/>
</media:community>
</media:group>
</entry>
</feed>