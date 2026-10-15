const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const DEVELOPER_ID = '1374158328409886834';

const economyDB = {}; 
const warnsDB = {};
const mysteryBoxCooldown = {};
const wheelCooldown = {};
const marriagesDB = {}; 
let activeDrop = null;

const randomEmojis = ['😀', '🔥', '🎉', '🚀', '⭐', '💎', '🎯', '✨', '🏆', '💯', '🎲', '⚡', '🤖', '🎮', '❤️', '🍀'];

const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('🏓 يعرض سرعة استجابة البوت'),
    new SlashCommandBuilder().setName('help').setDescription('📜 قائمة المساعدة الاحترافية وعرض جميع الأوامر'),
    new SlashCommandBuilder().setName('developer').setDescription('👑 معرفة معلومات المطور الأسطوري Vilkax Mary'),
    new SlashCommandBuilder().setName('invite').setDescription('🔗 رابط دعوة البوت الرسمي'),
    new SlashCommandBuilder().setName('avatar').setDescription('🖼️ عرض صورة الملف الشخصي').addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(false)),
    new SlashCommandBuilder().setName('user-info').setDescription('🛡️ معلومات حسابك الشخصي'),
    new SlashCommandBuilder().setName('server-info').setDescription('📊 إحصائيات السيرفر الشاملة'),
    new SlashCommandBuilder().setName('poll').setDescription('📊 إنشاء صندوق تصويت بالأزرار').addStringOption(opt => opt.setName('question').setDescription('السؤال').setRequired(true)),
    
    new SlashCommandBuilder().setName('bomb-race').setDescription('💣 سباق القنبلة الموقوتة (رهان 10k+)').addIntegerOption(opt => opt.setName('bet').setDescription('المبلغ').setRequired(true)),
    new SlashCommandBuilder().setName('russian-roulette').setDescription('🎯 الروليت الروسي ضد البوت').addIntegerOption(opt => opt.setName('bullets').setDescription('عدد الرصاصات (1-4)').setRequired(true)).addIntegerOption(opt => opt.setName('bet').setDescription('المبلغ').setRequired(true)),
    new SlashCommandBuilder().setName('spin-wheel').setDescription('🎡 تدوير عجلة الحظ الملكية (كل ساعة)'),
    new SlashCommandBuilder().setName('mystery-box').setDescription('🎁 صندوق الكنز اليومي (كل 24 ساعة)'),

    new SlashCommandBuilder().setName('balance').setDescription('💰 فحص رصيدك المالي'),
    new SlashCommandBuilder().setName('daily').setDescription('🎁 استلام الهدية المالية اليومية'),
    new SlashCommandBuilder().setName('top').setDescription('🏆 لوحة صدارة الأثرياء').addStringOption(opt => opt.setName('scope').setDescription('النطاق').setRequired(true).addChoices({ name: 'عالمي', value: 'global' }, { name: 'محلي', value: 'server' })),
    new SlashCommandBuilder().setName('casino').setDescription('🎰 كازينو الحظ بنسبة 50%').addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true)),
    new SlashCommandBuilder().setName('coinflip').setDescription('🪙 قلب العملة للرهان').addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true)).addStringOption(opt => opt.setName('choice').setDescription('اختر').setRequired(true).addChoices({ name: 'صورة', value: 'head' }, { name: 'كتابة', value: 'tail' })),

    new SlashCommandBuilder().setName('marry').setDescription('💍 طلب الزواج من عضو آخر').addUserOption(opt => opt.setName('partner').setDescription('الشريك').setRequired(true)),
    new SlashCommandBuilder().setName('badge').setDescription('🏆 عرض أوسمة الشرف الخاصة بك'),
    new SlashCommandBuilder().setName('fancy').setDescription('✨ زخرفة النصوص العادية').addStringOption(opt => opt.setName('text').setDescription('النص').setRequired(true)),
    new SlashCommandBuilder().setName('time').setDescription('⏰ عرض الوقت والتاريخ الحالي'),
    new SlashCommandBuilder().setName('whois').setDescription('🔍 معلومات عن أي عضو').addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('optibot').setDescription('⚡ لوحة أداء OptiBot الملكية'),
    new SlashCommandBuilder().setName('my-warns').setDescription('⚠️ فحص سجل الإنذارات الخاصة بك'),

    new SlashCommandBuilder().setName('image').setDescription('🎨 توليد صورة عبر الذكاء الاصطناعي').addStringOption(opt => opt.setName('prompt').setDescription('الوصف').setRequired(true)),
    new SlashCommandBuilder().setName('upscale').setDescription('🔍 رفع جودة ودقة الصورة').addAttachmentOption(opt => opt.setName('photo').setDescription('الصورة').setRequired(true)),

    new SlashCommandBuilder().setName('clear').setDescription('🧹 مسح الرسائل').addIntegerOption(opt => opt.setName('count').setDescription('العدد').setRequired(true)),
    new SlashCommandBuilder().setName('kick').setDescription('👢 طرد عضو').addUserOption(opt => opt.setName('target').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('ban').setDescription('🔨 حظر عضو').addUserOption(opt => opt.setName('target').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('mute').setDescription('🔇 كتم عضو مؤقتاً').addUserOption(opt => opt.setName('target').setDescription('العضو').setRequired(true)),
    new SlashCommandBuilder().setName('lock').setDescription('🔒 قفل القناة النصية'),
    new SlashCommandBuilder().setName('unlock').setDescription('🔓 فتح القناة النصية'),
    new SlashCommandBuilder().setName('warn').setDescription('⚠️ تحذير عضو').addUserOption(opt => opt.setName('target').setDescription('العضو').setRequired(true)).addStringOption(opt => opt.setName('reason').setDescription('السبب').setRequired(true)),
    new SlashCommandBuilder().setName('ticket').setDescription('🎫 تذاكر الدعم الفني'),

    new SlashCommandBuilder().setName('users-list').setDescription('👥 [للمطور] عرض المستخدمين المسجلين'),
    new SlashCommandBuilder().setName('dev-broadcast').setDescription('📢 [للمطور] إعلان رسمي شامل').addStringOption(opt => opt.setName('server_id').setDescription('الآيدي أو all').setRequired(true)).addStringOption(opt => opt.setName('message').setDescription('النص').setRequired(true)),
    new SlashCommandBuilder().setName('dev-panel').setDescription('🛠️ [للمطور] لوحة التحكم وغش Infinite'),
    new SlashCommandBuilder().setName('drop').setDescription('🎁 [للمطور] إسقاط صندوق جوائز').addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true)),
    new SlashCommandBuilder().setName('dev-give').setDescription('👑 [للمطور] منح أموال لعضو').addUserOption(opt => opt.setName('target').setDescription('العضو').setRequired(true)).addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true)),
    new SlashCommandBuilder().setName('servers').setDescription('🌐 [للمطور] عرض السيرفرات النشطة'),
    new SlashCommandBuilder().setName('leave-server').setDescription('🚪 [للمطور] مغادرة سيرفر').addStringOption(opt => opt.setName('server_id').setDescription('الآيدي').setRequired(true)),
    new SlashCommandBuilder().setName('spam').setDescription('⚡ [للمطور] اختبار السبام'),
    new SlashCommandBuilder().setName('say').setDescription('💬 إرسال رسالة رسمية').addStringOption(opt => opt.setName('message').setDescription('النص').setRequired(true))
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag} - Developer: Vilkax Mary`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName, user, guild } = interaction;
        const userId = user.id;

        const targetUser = interaction.options.getUser('target');
        const restrictedPunishments = ['kick', 'ban', 'mute', 'warn'];
        if (targetUser && targetUser.id === DEVELOPER_ID && userId !== DEVELOPER_ID && restrictedPunishments.includes(commandName)) {
            return interaction.reply({ content: `❌ لا يمكنك تنفيذ هذا الأمر ضد المطور **Vilkax Mary**!`, ephemeral: true });
        }

        switch (commandName) {
            case 'ping': {
                const sent = await interaction.reply({ content: '🏓 جاري قياس الاستجابة...', fetchReply: true, ephemeral: true });
                const latency = sent.createdTimestamp - interaction.createdTimestamp;
                return interaction.editReply({ content: `🏓 السرعة: **${latency} ميلي ثانية**` });
            }
            case 'help': {
                const helpEmbed = new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('📜 قائمة المساعدة الشاملة - البوت الملكي')
                    .setDescription('إليك كافة الأوامر والأنظمة المفعلة تحت إشراف المطور **Vilkax Mary**:')
                    .addFields(
                        { name: '💣 الألعاب واليناصيب', value: '`/bomb-race` • سباق القنبلة\n`/russian-roulette` • الروليت\n`/spin-wheel` • العجلة\n`/mystery-box` • الصندوق' },
                        { name: '💰 الاقتصاد والاستثمار', value: '`/balance` • الرصيد\n`/daily` • الهدية\n`/top` • الصدارة\n`/casino` • الكازينو\n`/coinflip` • العملة' },
                        { name: '💍 النظام الاجتماعي والفخامة', value: '`/marry` • زواج\n`/badge` • الأوسمة\n`/fancy` • زخرفة النصوص\n`/avatar` • الصور' },
                        { name: '🛡️ الإشراف والحماية', value: '`/clear` • مسح\n`/kick` / `/ban` / `/mute` • عقوبات\n`/lock` / `/unlock` • قفل\n`/ticket` • تذاكر\n`/warn` • إنذار' },
                        { name: '👑 الأوامر السيادية', value: '`/dev-panel` • لوحة المطور وغش Infinite\n`/dev-broadcast` • الإعلان الشامل\n`/users-list` • المستخدمين' }
                    )
                    .setFooter({ text: 'صنع وبرمجة المطور الأسطوري Vilkax Mary 👑' })
                    .setTimestamp();
                return interaction.reply({ embeds: [helpEmbed], ephemeral: true });
            }
            case 'developer':
                return interaction.reply({ content: '👑 المطور الأسطوري وصاحب الجلالة: **Vilkax Mary**', ephemeral: true });
            case 'invite':
                return interaction.reply({ content: `🔗 رابط دعوة البوت:\nhttps://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot+applications.commands&permissions=8`, ephemeral: true });
            case 'avatar': {
                const target = interaction.options.getUser('user') || user;
                return interaction.reply({ embeds: [new EmbedBuilder().setTitle(`🖼️ صورة ${target.username}`).setImage(target.displayAvatarURL({ size: 1024, dynamic: true }))], ephemeral: true });
            }
            case 'user-info':
                return interaction.reply({ content: `🛡️ معلومات حسابك: ${user.username} (ID: \`${user.id}\`)`, ephemeral: true });
            case 'server-info': {
                const serverEmbed = new EmbedBuilder().setColor(0x3498DB).setTitle(`📊 معلومات سيرفر: ${guild.name}`).setThumbnail(guild.iconURL({ dynamic: true })).addFields({ name: '👥 الأعضاء', value: `${guild.memberCount}`, inline: true });
                return interaction.reply({ embeds: [serverEmbed], ephemeral: true });
            }
            case 'poll': {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('poll_yes').setLabel('👍 موافق').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('poll_no').setLabel('👎 غير موافق').setStyle(ButtonStyle.Danger)
                );
                return interaction.reply({ content: `📊 تصويت: **${interaction.options.getString('question')}**`, components: [row] });
            }
            case 'time':
                return interaction.reply({ content: `⏰ الوقت والتاريخ الحالي مفعل ومضبوط بدقة تامة.`, ephemeral: true });
            case 'whois': {
                const target = interaction.options.getUser('user');
                return interaction.reply({ content: `🔍 معلومات العضو: ${target.username} (ID: \`${target.id}\`)`, ephemeral: true });
            }
            case 'optibot':
                return interaction.reply({ content: `⚡ لوحة أداء OptiBot الملكية: مستقر ويعمل بأعلى كفاءة في خدمة المطور **Vilkax Mary**.`, ephemeral: true });

            case 'bomb-race': {
                const bet = interaction.options.getInteger('bet');
                const currentBalance = economyDB[userId] || 0;
                if (bet < 10000) return interaction.reply({ content: '❌ الحد الأدنى للرهان هو **10,000 عملة**!', ephemeral: true });
                if (bet > currentBalance) return interaction.reply({ content: `❌ رصيدك الحالي لا يكفي!`, ephemeral: true });

                economyDB[userId] -= bet;

                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bomb_box_1_${bet}`).setLabel('🎟️ (1)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`bomb_box_2_${bet}`).setLabel('🎟️ (2)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`bomb_box_3_${bet}`).setLabel('🎟️ (3)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`bomb_box_4_${bet}`).setLabel('🎟️ (4)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`bomb_box_5_${bet}`).setLabel('🎟️ (5)').setStyle(ButtonStyle.Secondary)
                );
                const row2 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`bomb_box_6_${bet}`).setLabel('🎟️ (6)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`bomb_box_7_${bet}`).setLabel('🎟️ (7)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`bomb_box_8_${bet}`).setLabel('🎟️ (8)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`bomb_box_9_${bet}`).setLabel('🎟️ (9)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`bomb_box_10_${bet}`).setLabel('🎟️ (10)').setStyle(ButtonStyle.Secondary)
                );
                return interaction.reply({ content: `💣 **سباق القنبلة الموقوتة!** اختر أحد صناديق اليناصيب (الرهان: ${bet}):`, components: [row1, row2] });
            }
            case 'russian-roulette': {
                const bullets = interaction.options.getInteger('bullets');
                const bet = interaction.options.getInteger('bet');
                if (bullets < 1 || bullets > 4) return interaction.reply({ content: '❌ عدد الرصاصات بين 1 و 4!', ephemeral: true });
                const currentBalance = economyDB[userId] || 0;
                if (bet <= 0 || bet > currentBalance) return interaction.reply({ content: '❌ رصيد غير كافٍ للرهان!', ephemeral: true });

                const chamber = Math.floor(Math.random() * 6) + 1;
                if (chamber <= bullets) {
                    economyDB[userId] -= bet;
                    return interaction.reply({ content: `💥 أصابتك الرصاصة وخسرت ${bet} عملة!`, ephemeral: true });
                } else {
                    const winnings = Math.floor(bet * 2.0);
                    economyDB[userId] += winnings;
                    return interaction.reply({ content: `✨ نجوت وربحت مكافأة قدرها ${winnings} عملة!`, ephemeral: true });
                }
            }
            case 'spin-wheel': {
                const now = Date.now();
                if (userId === DEVELOPER_ID || !wheelCooldown[userId] || now - wheelCooldown[userId] > 3600000) {
                    wheelCooldown[userId] = now;
                    const prize = 2000;
                    economyDB[userId] = (economyDB[userId] || 0) + prize;
                    return interaction.reply({ content: `🎡 استقرت عجلة الحظ وربحت **${prize} عملة** ذهبية! 💰`, ephemeral: true });
                }
                return interaction.reply({ content: '⏳ يمكنك تدوير العجلة مرة كل ساعة!', ephemeral: true });
            }
            case 'mystery-box': {
                const now = Date.now();
                if (userId === DEVELOPER_ID || !mysteryBoxCooldown[userId] || now - mysteryBoxCooldown[userId] > 86400000) {
                    mysteryBoxCooldown[userId] = now;
                    const prize = 5000;
                    economyDB[userId] = (economyDB[userId] || 0) + prize;
                    return interaction.reply({ content: `🎁 فتحت صندوق الكنز اليومي وربحت **${prize} عملة**! 💎`, ephemeral: true });
                }
                return interaction.reply({ content: '⏳ صندوق الكنز يفتح مرة كل 24 ساعة!', ephemeral: true });
            }

            case 'balance':
                return interaction.reply({ content: `💵 رصيدك الحالي: **${economyDB[userId] || 0} عملة** ذهبية 💰`, ephemeral: true });
            case 'daily':
                economyDB[userId] = (economyDB[userId] || 0) + 1000;
                return interaction.reply({ content: '🎉 استلمت هديتك اليومية (1000 عملة) بنجاح! 🎁', ephemeral: true });
            case 'top': {
                const sorted = Object.entries(economyDB).sort((a, b) => b[1] - a[1]).slice(0, 5);
                let desc = sorted.length === 0 ? '📭 لا توجد أرصدة بعد!' : sorted.map(([id, bal], i) => `#${i + 1} - <@${id}> : \`${bal}\` عملة`).join('\n');
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xF1C40F).setTitle('🏆 لوحة صدارة أثرياء البوت').setDescription(desc)], ephemeral: true });
            }
            case 'casino': {
                const amount = interaction.options.getInteger('amount');
                const bal = economyDB[userId] || 0;
                if (amount <= 0 || amount > bal) return interaction.reply({ content: '❌ رصيد غير كافٍ!', ephemeral: true });
                const win = Math.random() < 0.5;
                if (win) {
                    economyDB[userId] += amount;
                    return interaction.reply({ content: `🎰 مبروك الفوز في الكازينو! ربحت **${amount} عملة**! 💰`, ephemeral: true });
                } else {
                    economyDB[userId] -= amount;
                    return interaction.reply({ content: `🎲 خسرت الرهان في الكازينو! 📉`, ephemeral: true });
                }
            }
            case 'coinflip': {
                const amount = interaction.options.getInteger('amount');
                const choice = interaction.options.getString('choice');
                const bal = economyDB[userId] || 0;
                if (amount <= 0 || amount > bal) return interaction.reply({ content: '❌ رصيد غير كافٍ!', ephemeral: true });
                const result = Math.random() < 0.5 ? 'head' : 'tail';
                if (choice === result) {
                    economyDB[userId] += amount;
                    return interaction.reply({ content: `🪙 جاءت النتيجة مطابقة لاختيارك! ربحت **${amount} عملة**! 🎉`, ephemeral: true });
                } else {
                    economyDB[userId] -= amount;
                    return interaction.reply({ content: `🪙 لم تكن محظوظاً، جاءت النتيجة عكس اختيارك! 📉`, ephemeral: true });
                }
            }

            case 'marry': {
                const partner = interaction.options.getUser('partner');
                if (partner.id === userId) return interaction.reply({ content: '❌ لا يمكنك الزواج من نفسك!', ephemeral: true });
                const marryRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`accept_marry_${userId}_${partner.id}`).setLabel('💍 موافقة').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`refuse_marry_${partner.id}`).setLabel('💔 رفض').setStyle(ButtonStyle.Danger)
                );
                return interaction.reply({ content: `${partner}, تلقيت عرض زواج رومانسياً من ${user}! 🌹`, components: [marryRow] });
            }
            case 'badge': {
                const badgeTitle = userId === DEVELOPER_ID ? '👑 المطور الأسطوري وصانع النظام (Vilkax Mary)' : '🌟 عضو مميز في السيرفر';
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x9B59B6).setTitle(`🏆 أوسمة الشرف`).setDescription(`• **لقبك الحالي:** ${badgeTitle}`)], ephemeral: true });
            }
            case 'fancy': {
                const text = interaction.options.getString('text');
                const fancyMap = { 'a': '𝖆', 'b': '𝖇', 'c': '𝖈', 'd': '🇩', 'e': '𝖊', 'f': '𝖋', 'g': '𝖌', 'h': '𝖍', 'i': '𝖎', 'j': '𝖏', 'k': '𝖐', 'l': '𝖑', 'm': '𝖒', 'n': '𝖓', 'o': '𝖔', 'p': '𝓅', 'q': '𝓆', 'r': '𝓻', 's': '𝖘', 't': '𝖙', 'u': '𝖚', 'v': '𝓿', 'w': '𝕨', 'x': '𝔁', 'y': '𝔂', 'z': '𝔃' };
                const fancyText = text.split('').map(char => fancyMap[char] || char).join('');
                return interaction.reply({ content: `✨ **النص المزخرف:** \`${fancyText}\``, ephemeral: true });
            }
            case 'my-warns': {
                const warns = warnsDB[userId] || [];
                return interaction.reply({ content: warns.length > 0 ? `⚠️ الإنذارات: ${warns.join(', ')}` : `✅ سجلك نظيف تماماً وليس لديك أي إنذارات!`, ephemeral: true });
            }

            case 'image': {
                const prompt = interaction.options.getString('prompt');
                await interaction.deferReply();
                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
                return interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x9B59B6).setTitle('🎨 نتيجة توليد الصورة').setImage(imageUrl)] });
            }
            case 'upscale': {
                const photo = interaction.options.getAttachment('photo');
                return interaction.reply({ content: `🔍 تم رفع جودة ودقة الصورة بنجاح (4K).\n🔗 الرابط: ${photo.url}`, ephemeral: true });
            }

            case 'clear':
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) return interaction.reply({ content: '❌ ليس لديك صلاحية!', ephemeral: true });
                await interaction.channel.bulkDelete(interaction.options.getInteger('count'), true);
                return interaction.reply({ content: '🧹 تم مسح الرسائل بنجاح.', ephemeral: true });
            case 'kick':
                if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) return interaction.reply({ content: '❌ ليس لديك صلاحية!', ephemeral: true });
                await guild.members.kick(targetUser.id);
                return interaction.reply({ content: `👢 تم طرد العضو بنجاح.` });
            case 'ban':
                if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({ content: '❌ ليس لديك صلاحية!', ephemeral: true });
                await guild.members.ban(targetUser.id);
                return interaction.reply({ content: `🔨 تم حظر العضو بنجاح.` });
            case 'mute':
                if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ ليس لديك صلاحية!', ephemeral: true });
                const memberToMute = await guild.members.fetch(targetUser.id);
                await memberToMute.timeout(10 * 60 * 1000);
                return interaction.reply({ content: `🔇 تم كتم العضو لمدة 10 دقائق.` });
            case 'lock':
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({ content: '❌ ليس لديك صلاحية!', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(guild.id, { SendMessages: false });
                return interaction.reply({ content: '🔒 تم قفل القناة النصية.' });
            case 'unlock':
                if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) return interaction.reply({ content: '❌ ليس لديك صلاحية!', ephemeral: true });
                await interaction.channel.permissionOverwrites.edit(guild.id, { SendMessages: null });
                return interaction.reply({ content: '🔓 تم فتح القناة النصية.' });
            case 'warn': {
                if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: '❌ ليس لديك صلاحية!', ephemeral: true });
                const reason = interaction.options.getString('reason');
                if (!warnsDB[targetUser.id]) warnsDB[targetUser.id] = [];
                warnsDB[targetUser.id].push(reason);
                return interaction.reply({ content: `⚠️ تم تحذير العضو. السبب: ${reason}` });
            }
            case 'ticket': {
                const ticketRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('create_ticket').setLabel('🎫 فتح تذكرة دعم').setStyle(ButtonStyle.Success));
                return interaction.reply({ content: '🎫 انقر الزر أدناه لفتح تذكرة دعم فني:', components: [ticketRow] });
            }

            case 'users-list': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور حصرياً!', ephemeral: true });
                const userIds = Object.keys(economyDB);
                let description = userIds.length === 0 ? '📭 لا يوجد مستخدمون مسجلون بعد!' : userIds.map((id, index) => `${index + 1}. <@${id}> — الرصيد: \`${economyDB[id]}\` عملة`).join('\n');
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x3498DB).setTitle('👥 قائمة مستخدمي البوت النشطين').setDescription(description)], ephemeral: true });
            }
            case 'dev-broadcast': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور حصرياً!', ephemeral: true });
                const targetGuildId = interaction.options.getString('server_id');
                const broadcastMsg = interaction.options.getString('message');
                const embed = new EmbedBuilder().setColor(0xFFD700).setTitle('📢 إعلان رسمي من المطور الأسطوري').setDescription(broadcastMsg).setTimestamp();

                if (targetGuildId.toLowerCase() === 'all') {
                    let count = 0;
                    client.guilds.cache.forEach(async (g) => {
                        const ch = g.channels.cache.find(c => c.isTextBased() && c.permissionsFor(g.members.me).has('SendMessages'));
                        if (ch) { await ch.send({ embeds: [embed] }).catch(() => {}); count++; }
                    });
                    return interaction.reply({ content: `✅ تم إرسال الإعلان إلى ${count} سيرفر!`, ephemeral: true });
                } else {
                    const g = client.guilds.cache.get(targetGuildId);
                    if (!g) return interaction.reply({ content: '❌ السيرفر غير موجود!', ephemeral: true });
                    const ch = g.channels.cache.find(c => c.isTextBased() && c.permissionsFor(g.members.me).has('SendMessages'));
                    if (!ch) return interaction.reply({ content: '❌ لا توجد قناة صالحة!', ephemeral: true });
                    await ch.send({ embeds: [embed] });
                    return interaction.reply({ content: `✅ تم إرسال الإعلان بنجاح!`, ephemeral: true });
                }
            }
            case 'dev-panel': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور حصرياً!', ephemeral: true });
                const devRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('dev_cheat_money').setLabel('💰 حقن 100k').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('dev_infinite').setLabel('♾️ تفعيل Infinite').setStyle(ButtonStyle.Success)
                );
                return interaction.reply({ content: '👑 لوحة تحكم المطور:', components: [devRow], ephemeral: true });
            }
            case 'drop': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور فقط!', ephemeral: true });
                const amount = interaction.options.getInteger('amount');
                activeDrop = { amount, claimed: false };
                const dropRow = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('claim_drop').setLabel('🏃‍♂️ التقاط الكنز!').setStyle(ButtonStyle.Success));
                return interaction.reply({ content: `🎁 صندوق كنز بقيمة **${amount} عملة** تم إسقاطه بواسطة المطور!`, components: [dropRow] });
            }
            case 'dev-give': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور فقط!', ephemeral: true });
                const amount = interaction.options.getInteger('amount');
                economyDB[targetUser.id] = (economyDB[targetUser.id] || 0) + amount;
                return interaction.reply({ content: `👑 تم منح **${amount} عملة** للعضو بنجاح!` });
            }
            case 'servers': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور فقط!', ephemeral: true });
                const list = client.guilds.cache.map(g => `• **${g.name}** (\`${g.id}\`)`).join('\n');
                return interaction.reply({ content: `🌐 السيرفرات النشطة:\n${list}`, ephemeral: true });
            }
            case 'leave-server': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور فقط!', ephemeral: true });
                const g = client.guilds.cache.get(interaction.options.getString('server_id'));
                if (!g) return interaction.reply({ content: '❌ السيرفر غير موجود!', ephemeral: true });
                await g.leave();
                return interaction.reply({ content: `✅ تم مغادرة سيرفر ${g.name}`, ephemeral: true });
            }
            case 'spam': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور فقط!', ephemeral: true });
                await interaction.reply({ content: '⚡ جاري تنفيذ السبام...', ephemeral: true });
                for (let i = 0; i < 20; i++) await interaction.channel.send('👑');
                break;
            }
            case 'say': {
                if (userId !== DEVELOPER_ID) return interaction.reply({ content: '❌ للمطور فقط!', ephemeral: true });
                await interaction.channel.send(interaction.options.getString('message'));
                return interaction.reply({ content: '✅ تم الإرسال.', ephemeral: true });
            }
        }
    } 
    else if (interaction.isButton()) {
        const userId = interaction.user.id;
        const { customId, user } = interaction;

        if (customId.startsWith('bomb_box_')) {
            const bet = parseInt(customId.split('_')[3]);
            const isExplosion = Math.random() < 0.7;
            if (isExplosion) {
                return interaction.update({ content: `💥 **انفجرت القنبلة يا ${user}!** خسرت رهانك البالغ ${bet} عملة.`, components: [] });
            } else {
                const prize = Math.floor(bet * 2.5);
                economyDB[userId] = (economyDB[userId] || 0) + prize;
                return interaction.update({ content: `🎉 **مبروك الأسطورة ${user}!** تجنبت القنبلة وربحت **${prize} عملة**!`, components: [] });
            }
        }
        if (customId === 'dev_cheat_money') {
            if (userId !== DEVELOPER_ID) return;
            economyDB[userId] = (economyDB[userId] || 0) + 100000;
            return interaction.reply({ content: '🛠️ تم حقن 100k عملة بنجاح!', ephemeral: true });
        }
        if (customId === 'dev_infinite') {
            if (userId !== DEVELOPER_ID) return;
            economyDB[userId] = 999999999;
            return interaction.reply({ content: '♾️ تم تفعيل رصيد (Infinite) بنجاح!', ephemeral: true });
        }
        if (customId === 'create_ticket') {
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ]
            });
            return interaction.reply({ content: `✅ تم إنشاء تذكرتك: ${ticketChannel}`, ephemeral: true });
        }
        if (customId === 'claim_drop') {
            if (!activeDrop || activeDrop.claimed) return interaction.reply({ content: '❌ انتهت الجائزة أو تم التقاطها مسبقاً!', ephemeral: true });
            activeDrop.claimed = true;
            economyDB[userId] = (economyDB[userId] || 0) + activeDrop.amount;
            return interaction.update({ content: `🏆 مبروك للأسطورة ${user} التقط الكنز وربح **${activeDrop.amount} عملة**!`, components: [] });
        }
        if (customId.startsWith('accept_marry_')) {
            const [, , proposerId, partnerId] = customId.split('_');
            if (userId !== partnerId) return interaction.reply({ content: '❌ ليس موجهاً إليك!', ephemeral: true });
            marriagesDB[proposerId] = partnerId;
            return interaction.update({ content: `💍 تم قبول الزواج بنجاح وتوثيق العقد رسمياً!`, components: [] });
        }
        if (customId.startsWith('refuse_marry_')) {
            return interaction.update({ content: `💔 تم رفض طلب الزواج.`, components: [] });
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase().trim();
    const userId = message.author.id;

    try {
        if (userId === DEVELOPER_ID) {
            await message.react('👑');
        } else {
            const randomEmoji = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
            await message.react(randomEmoji);
        }
    } catch (e) {}

    if (content.includes('سلام عليكم') || content.includes('السلام عليكم') || content.includes('salam')) {
        return message.reply('✨ **وعليكم السلام ورحمة الله تعالى وبركاته** 🌸');
    }

    if (content === 'hi' || content.startsWith('hi ') || content === 'hello') {
        return message.reply('Hello! Welcome to the server. How can I help you today? 👋');
    }
});

client.login(process.env.DISCORD_TOKEN);
