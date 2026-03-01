const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    let servers = 0, users = 0, name = 'Security Bot', avatar = '';

    try {
        if (BOT_TOKEN) {
            const uRes = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
            });
            if (uRes.ok) {
                const u = await uRes.json();
                name = u.username || name;
                if (u.avatar) avatar = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256`;
            }

            const gRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
            });
            if (gRes.ok) {
                const guilds = await gRes.json();
                servers = guilds.length;
                const batch = guilds.slice(0, 50);
                const counts = await Promise.all(batch.map(async g => {
                    try {
                        const r = await fetch(`https://discord.com/api/v10/guilds/${g.id}?with_counts=true`, {
                            headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
                        });
                        if (r.ok) { const d = await r.json(); return d.approximate_member_count || 0; }
                        return 0;
                    } catch { return 0; }
                }));
                const total = counts.reduce((a, b) => a + b, 0);
                users = guilds.length > 50 && total > 0 ? Math.round((total / batch.length) * guilds.length) : total;
            }
        }
    } catch (e) { console.error(e); }

    res.status(200).json({ name, avatar, servers, users, live: servers > 0 });
};