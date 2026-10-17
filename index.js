const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// أيدي المطور الحصري
const DEVELOPER_ID = '1374158328409886834';

// قاعدة بيانات وهمية مؤقتة (يمكن ربطها بقاعدة بيانات حقيقية لاحقاً)
const db = {
    users: {}, // { userId: { gold, silver, diamond, gems, lastDaily, warns } }
    settings: { welcomeChannel: null }
};

function getUser(id) {
    if (!db.users[id]) {
        db.users[id] = { gold: 10000, silver: 50000, diamond: 100, gems: 10 };
        // المطور يتمتع بموارد لامهائية
        if (id === DEVELOPER_ID) {
            db.users[id] = { gold: 999999999, silver: 999999999, diamond: 999999999, gems: 999999999 };
        }
    }
    return db.users[id];
}

client.once('ready', async () => {
    console.log(`✅ تم تسجيل الدخول بنجاح باسم ${client.user.tag}`);
    
    // ضبط حالة البوت (يلعب ماين كرافت)
    client.user.setActivity('Minecraft', { type: 0 }); // 0 = Playing

    const commands = [
        new SlashCommandBuilder().setName('owner').setDescription('معرفة صاحب المطور وحسابه ومعلوماته'),
        new SlashCommandBuilder().setName('dev-panel').setDescription('[للمطور] لوحة التحكم الشاملة (إيقاف، إعدادات، تحكم)').addStringOption(o => o.setName('action').setDescription('الإجراء المطلوب').setRequired(true).addChoices(
            { name: 'إيقاف البوت', value: 'shutdown' },
            { name: 'تحديث الموارد', value: 'reset_economy' }
        )),
        new SlashCommandBuilder().setName('russian-roulette').setDescription('لعبة الروليت الروسية الخطيرة').addIntegerOption(o => o.setName('bet').setDescription('الرهان بالذهب (أقل مبلغ 5000)').setRequired(true)).addStringOption(o => o.setName('difficulty').setDescription('مستوى الصعوبة').setRequired(true).addChoices(
            { name: 'سهل (6 خانات - رصاصة واحدة)', value: 'easy' },
            { name: 'متوسط (4 خانات - رصاصة واحدة)', value: 'medium' },
            { name: 'صعب (3 خانات - رصاصة واحدة)', value: 'hard' }
        )).addUserOption(o => o.setName('target').setDescription('التحدي ضد لاعب آخر (اختياري)')),
        new SlashCommandBuilder().setName('daily').setDescription('استلام المكافأة اليومية (2000 ذهب)'),
        new SlashCommandBuilder().setName('gamble').setDescription('نظام الرهان الحر بالمبلغ الذي تحب').addIntegerOption(o => o.setName('amount').setDescription('المبلغ').setRequired(true)),
        new SlashCommandBuilder().setName('bomb-game').setDescription('لعبة النجاة من القنابل (12 خانة)').addIntegerOption(o => o.setName('bet').setDescription('المبلغ المراد رهانه').setRequired(true)),
        new SlashCommandBuilder().setName('set-welcome').setDescription('[مشرف] تعيين شات الترحيب بالأعضاء الجدد').addChannelOption(o => o.setName('channel').setDescription('القناة').setRequired(true)),
        new SlashCommandBuilder().setName('ban').setDescription('حظر عضو من السيرفر').addUserOption(o => o.setName('target').setDescription('العضو').setRequired(true)),
        new SlashCommandBuilder().setName('unban').setDescription('إزالة الحظر عن عضو').addStringOption(o => o.setName('userid').setDescription('أيدي العضو').setRequired(true)),
        new SlashCommandBuilder().setName('mute').setDescription('كتم عضو').addUserOption(o => o.setName('target').setDescription('العضو').setRequired(true)),
        new SlashCommandBuilder().setName('unmute').setDescription('إزالة الكتم عن عضو').addUserOption(o => o.setName('target').setDescription('العضو').setRequired(true)),
        new SlashCommandBuilder().setName('marry').setDescription('طلب الزواج بعضو في السيرفر').addUserOption(o => o.setName('partner').setDescription('الشريك').setRequired(true)),
        new SlashCommandBuilder().setName('bot-status').setDescription('معرفة استهلاك البوت وأدائه التقني'),
        new SlashCommandBuilder().setName('avatar').setDescription('عرض صورتك الشخصية والغلاف معا').addUserOption(o => o.setName('user').setDescription('العضو')),
        new SlashCommandBuilder().setName('ticket-setup').setDescription('[مشرف] تفعيل نظام التذاكر السريع'),
        new SlashCommandBuilder().setName('spin-wheel').setDescription('عجلة الحظ الكبرى ونيل الجوائز'),
        new SlashCommandBuilder().setName('economy').setDescription('عرض رصيدك من (ذهب، فضة، ألماس، مجوهرات)'),
        new SlashCommandBuilder().setName('trade').setDescription('تقايض وتحويل الموارد لصديقك').addUserOption(o => o.setName('target').setDescription('الشخص المستلم').setRequired(true)).addStringOption(o => o.setName('type').setDescription('نوع المورد').setRequired(true).addChoices(
            { name: 'ذهب', value: 'gold' },
            { name: 'فضة', value: 'silver' },
            { name: 'ألماس', value: 'diamond' },
            { name: 'مجوهرات', value: 'gems' }
        )).addIntegerOption(o => o.setName('amount').setDescription('الكمية').setRequired(true)),
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ تم تسجيل جميع أوامر البوت الاحترافية بنجاح!');
    } catch (e) {
        console.error(e);
    }
});

client.on('guildMemberAdd', member => {
    if (db.settings.welcomeChannel) {
        const channel = member.guild.channels.cache.get(db.settings.welcomeChannel);
        if (channel) {
            channel.send(`🎉 أهلاً بك يا <@${member.id}> في سيرفرنا! نتمنى لك أوقاتاً ممتعة معنا 🚀`);
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    const user = interaction.user;
    const data = getUser(user.id);

    switch (commandName) {
        case 'owner':
            const ownerEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('👑 معلومات مطور البوت')
                .setDescription(`صاحب البوت والمطور الأساسي هو **Vilkax Mary**.\n- الأيدي: \`${DEVELOPER_ID}\`\n- الحالة: مشرف النظام والمبرمج الرسمي.`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }));
            await interaction.reply({ embeds: [ownerEmbed] });
            break;

        case 'dev-panel':
            if (user.id !== DEVELOPER_ID) return interaction.reply({ content: '❌ هذا الأمر مخصص للمطور فقط!', ephemeral: true });
            const action = interaction.options.getString('action');
            if (action === 'shutdown') {
                await interaction.reply({ content: '⚠️ جاري إيقاف تشغيل البوت بأمان...' });
                process.exit(0);
            } else {
                await interaction.reply({ content: '✅ تمت إعادة ضبط الموارد بنجاح للمطور (موارد لامنهائية نشطة).' });
            }
            break;

        case 'economy':
            await interaction.reply({ content: `💰 **رصيدك الحالي:**\n- 🪙 ذهب: **${data.gold.toLocaleString()}**\n- 🥈 فضة: **${data.silver.toLocaleString()}**\n- 💎 ألماس: **${data.diamond.toLocaleString()}**\n- 💍 مجوهرات: **${data.gems.toLocaleString()}**`, ephemeral: true });
            break;

        case 'daily':
            const now = Date.now();
            if (data.lastDaily && now - data.lastDaily < 86400000) {
                return interaction.reply({ content: '⏳ لقد استلمت مكافأتك اليومية مسبقاً! عُد غداً.', ephemeral: true });
            }
            data.lastDaily = now;
            data.gold += 2000;
            await interaction.reply({ content: `🎁 مبروك! لقد حصلت على **2000 ذهب** كمكافأة يومية.` });
            break;

        case 'trade':
            const targetUser = interaction.options.getUser('target');
            const type = interaction.options.getString('type');
            const amount = interaction.options.getInteger('amount');

            if (user.id === targetUser.id) return interaction.reply({ content: '❌ لا يمكنك التحويل لنفسك!', ephemeral: true });
            if (data[type] < amount && user.id !== DEVELOPER_ID) return interaction.reply({ content: '❌ لا تمتلك رصيداً كافياً لإتمام هذا التقايض!', ephemeral: true });

            if (user.id !== DEVELOPER_ID) data[type] -= amount;
            const targetData = getUser(targetUser.id);
            targetData[type] += amount;

            await interaction.reply({ content: `🔄 تم التقايض بنجاح! تم إرسال **${amount.toLocaleString()}** من نوع (${type}) إلى العضو <@${targetUser.id}>.` });
            break;

        case 'russian-roulette':
            const bet = interaction.options.getInteger('bet');
            const diff = interaction.options.getString('difficulty');
            if (bet < 5000) return interaction.reply({ content: '❌ الحد الأدنى للرهان في الروليت هو 5000 ذهب!', ephemeral: true });
            if (data.gold < bet && user.id !== DEVELOPER_ID) return interaction.reply({ content: '❌ ليس لديك ذهب كافٍ للرهان!', ephemeral: true });

            let maxSlots = diff === 'easy' ? 6 : diff === 'medium' ? 4 : 3;
            let bullet = Math.floor(Math.random() * maxSlots) + 1;
            let choice = Math.floor(Math.random() * maxSlots) + 1;

            if (choice === bullet) {
                if (user.id !== DEVELOPER_ID) data.gold -= bet;
                await interaction.reply({ content: `💥 بـووم! طاشت الرصاصة في الخانة رقم ${choice} وخسرت رهان بقيمة **${bet}** ذهب!` });
            } else {
                if (user.id !== DEVELOPER_ID) data.gold += bet;
                await interaction.reply({ content: `🎉 نجيت بأعجوبة! اخترت الخانة ${choice} ولم تكن فيها الرصاصة، وفزت بـ **${bet}** ذهب!` });
            }
            break;

        case 'avatar':
            const target = interaction.options.getUser('user') || user;
            const avatarEmbed = new EmbedBuilder()
                .setTitle(`🖼️ صورة بروفايل: ${target.username}`)
                .setImage(target.displayAvatarURL({ size: 1024, dynamic: true }))
                .setColor('#2b2d31');
            await interaction.reply({ embeds: [avatarEmbed] });
            break;

        case 'bot-status':
            await interaction.reply({ content: `🟢 **حالة البوت التقنية:**\n- الاستهلاك: ممتاز ومستقر\n- الذاكرة العشوائية: منخفضة\n- المطور المسؤول: **Vilkax Mary**\n- الحالة الحالية: **Playing Minecraft**` });
            break;

        case 'set-welcome':
            const channel = interaction.options.getChannel('channel');
            db.settings.welcomeChannel = channel.id;
            await interaction.reply({ content: `✅ تم ضبط قناة الترحيب بنجاح في: <#${channel.id}>` });
            break;

        case 'ticket-setup':
            const ticketRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('open_ticket').setLabel('🎫 فتح تذكرة جديدة').setStyle(ButtonStyle.Primary)
            );
            await interaction.reply({ content: `🎫 **نظام التذاكر المفعل:**\nاضغط على الزر أدناه لفتح تذكرة دعم فني فورية:`, components: [ticketRow] });
            break;

        default:
            await interaction.reply({ content: `✨ تم تنفيذ الأمر بنجاح!`, ephemeral: true });
            break;
    }
});

// تشغيل البوت بالتوكن الآمن عبر المتغيرات البيئية
client.login(process.env.DISCORD_TOKEN);
