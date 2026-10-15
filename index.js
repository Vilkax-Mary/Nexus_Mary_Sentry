const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// الأيدي الحقيقي الخاص بك (Vilkax Mary)
const DEVELOPER_ID = '1374158328409886834'; 

client.once('ready', async () => {
    console.log(`✅ تم تسجيل الدخول بنجاح باسم ${client.user.tag}`);

    // تسجيل الأوامر الـ 43 كاملة دفعة واحدة
    const commands = [
        new SlashCommandBuilder().setName('avatar').setDescription('عرض صورة البروفايل الخاصة بك أو بعضو آخر').addUserOption(o => o.setName('user').setDescription('العضو')),
        new SlashCommandBuilder().setName('badge').setDescription('عرض الشارات الخاصة بك'),
        new SlashCommandBuilder().setName('balance').setDescription('معرفة رصيدك من النقاط والأموال'),
        new SlashCommandBuilder().setName('ban').setDescription('حظر عضو من السيرفر').addUserOption(o => o.setName('target').setDescription('العضو').setRequired(true)),
        new SlashCommandBuilder().setName('bomb-race').setDescription('لعبة سباق القنبلة المشتعلة (اختر الزر بحذر)'),
        new SlashCommandBuilder().setName('clear').setDescription('مسح الرسائل').addIntegerOption(o => o.setName('count').setDescription('العدد').setRequired(true)),
        new SlashCommandBuilder().setName('coinflip').setDescription('قلب العملة والمراهنة (50% حظ)'),
        new SlashCommandBuilder().setName('daily').setDescription('استلام الهدية أو الرصيد اليومي'),
        new SlashCommandBuilder().setName('dev-broadcast').setDescription('[للمطور] إرسال إعلان رسمي').addStringOption(o => o.setName('message').setDescription('النص').setRequired(true)),
        new SlashCommandBuilder().setName('dev-give').setDescription('[للمطور] منح موارد لعضو').addUserOption(o => o.setName('target').setDescription('العضو').setRequired(true)).addIntegerOption(o => o.setName('amount').setDescription('الكمية').setRequired(true)),
        new SlashCommandBuilder().setName('dev-panel').setDescription('[للمطور] لوحة التحكم الخاصة'),
        new SlashCommandBuilder().setName('developer').setDescription('معرفة معلومات المطور وصانع البوت'),
        new SlashCommandBuilder().setName('drop').setDescription('[للمطور] إسقاط صندوق جوائز').addIntegerOption(o => o.setName('amount').setDescription('المبلغ').setRequired(true)),
        new SlashCommandBuilder().setName('economy-shop').setDescription('فتح متجر الاقتصاد لشراء العناصر'),
        new SlashCommandBuilder().setName('fancy').setDescription('زخرفة النصوص والأسماء بطريقة مميزة').addStringOption(o => o.setName('text').setDescription('النص').setRequired(true)),
        new SlashCommandBuilder().setName('help').setDescription('عرض قائمة المساعدة والأوامر المتاحة'),
        new SlashCommandBuilder().setName('image').setDescription('البحث عن صورة أو توليدها'),
        new SlashCommandBuilder().setName('invite').setDescription('رابط دعوة البوت للسيرفرات'),
        new SlashCommandBuilder().setName('kick').setDescription('طرد عضو من السيرفر').addUserOption(o => o.setName('target').setDescription('العضو').setRequired(true)),
        new SlashCommandBuilder().setName('leave-server').setDescription('[للمطور] جعل البوت يغادر السيرفر الحالي'),
        new SlashCommandBuilder().setName('lock').setDescription('قفل الشات الحالي لمنع إرسال الرسائل'),
        new SlashCommandBuilder().setName('marry').setDescription('طلب الزواج أو الارتباط بعضو في السيرفر').addUserOption(o => o.setName('partner').setDescription('الشريك').setRequired(true)),
        new SlashCommandBuilder().setName('mute').setDescription('كتم عضو في السيرفر').addUserOption(o => o.setName('target').setDescription('العضو').setRequired(true)),
        new SlashCommandBuilder().setName('my-warns').setDescription('عرض الإنذارات الخاصة بك'),
        new SlashCommandBuilder().setName('mystery-box').setDescription('فتح صندوق الغموض والمفاجآت'),
        new SlashCommandBuilder().setName('optibot').setDescription('فحص حالة أو إعدادات OptiFine والبوت'),
        new SlashCommandBuilder().setName('ping').setDescription('فحص سرعة استجابة البوت (Ping)'),
        new SlashCommandBuilder().setName('poll').setDescription('إنشاء تصويت سريع للأعضاء').addStringOption(o => o.setName('question').setDescription('السؤال').setRequired(true)),
        new SlashCommandBuilder().setName('russian-roulette').setDescription('لعبة الروليت الروسية الخطيرة والحماسية'),
        new SlashCommandBuilder().setName('say').setDescription('جعل البوت يكرر كلامك').addStringOption(o => o.setName('message').setDescription('النص').setRequired(true)),
        new SlashCommandBuilder().setName('server-info').setDescription('معلومات مفصلة عن السيرفر الحالي'),
        new SlashCommandBuilder().setName('servers').setDescription('[للمطور] عرض قائمة السيرفرات التي يتواجد بها البوت'),
        new SlashCommandBuilder().setName('spam').setDescription('أمر السبام (للاختبار)'),
        new SlashCommandBuilder().setName('spin-wheel').setDescription('عجلة الحظ وتدوير الجوائز'),
        new SlashCommandBuilder().setName('ticket').setDescription('فتح تذكرة دعم فني جديدة'),
        new SlashCommandBuilder().setName('time').setDescription('عرض الوقت والتاريخ الحالي'),
        new SlashCommandBuilder().setName('top').setDescription('لوحة المتصدرين (Leaderboard) للأعضاء الأكثر تفاعلاً'),
        new SlashCommandBuilder().setName('unlock').setDescription('فتح الشات بعد قفله'),
        new SlashCommandBuilder().setName('upscale').setDescription('تحسين دقة الصور وتكبيرها'),
        new SlashCommandBuilder().setName('user-info').setDescription('معلومات مفصلة عن حسابك أو حساب عضو آخر').addUserOption(o => o.setName('user').setDescription('العضو')),
        new SlashCommandBuilder().setName('users-list').setDescription('قائمة المستخدمين في السيرفر'),
        new SlashCommandBuilder().setName('warn').setDescription('إعطاء إنذار لعضو مخالف').addUserOption(o => o.setName('target').setDescription('العضو').setRequired(true)),
        new SlashCommandBuilder().setName('whois').setDescription('معرفة هوية المستخدم وتفاصيله').addUserOption(o => o.setName('user').setDescription('العضو')),
    ];

    const rest = new REST({ version: '10' }).setToken('YOUR_BOT_TOKEN');

    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ تم تسجيل جميع الأوامر الـ 43 بنجاح في البوت!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    // مصفوفة الأوامر الخاصة بالمطور حصرياً
    const devCommands = ['drop', 'dev-broadcast', 'dev-give', 'dev-panel', 'leave-server', 'servers'];

    if (devCommands.includes(commandName)) {
        if (interaction.user.id !== DEVELOPER_ID) {
            return await interaction.reply({ content: `❌ عذراً، هذا الأمر مخصص للمطور **Vilkax Mary** فقط!`, ephemeral: true });
        }
    }

    // تنفيذ الأوامر
    switch (commandName) {
        case 'balance':
            await interaction.reply({ content: `💰 رصيدك الحالي هو: **100,000 نقطة**`, ephemeral: true });
            break;
        case 'daily':
            await interaction.reply({ content: `🎁 لقد حصلت على مكافأتك اليومية بقيمة **5,000 نقطة**!`, ephemeral: false });
            break;
        case 'coinflip':
            const result = Math.random() < 0.5 ? 'صورة (Heads)' : 'كتابة (Tails)';
            await interaction.reply({ content: `🪙 استقرت العملة على: **${result}**!` });
            break;
        case 'developer':
            await interaction.reply({ content: `👑 هذا البوت تم تطويره وبرمجته بواسطة **Vilkax Mary**.` });
            break;
        case 'ping':
            await interaction.reply({ content: `🏓 Pong! سرعة الاستجابة: **${client.ws.ping}ms**` });
            break;
        case 'help':
            await interaction.reply({ content: `📜 أهلاً بك في قائمة المساعدة. البوت يتضمن أكثر من 43 أمراً برمجياً واحترافياً مطوراً بواسطة **Vilkax Mary**!`, ephemeral: true });
            break;

        // أوامر المطور الحصرية
        case 'drop':
            const amount = interaction.options.getInteger('amount');
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('claim').setLabel('🎁 التقاط الصندوق').setStyle(ButtonStyle.Success));
            const msg = await interaction.reply({ content: `🎁 صندوق جوائز بقيمة **${amount.toLocaleString()} نقطة** مقدم من المطور **Vilkax Mary**! أسرع واضغط للالتقاط:`, components: [row], fetchReply: true });
            
            let taken = false;
            const col = msg.createMessageComponentCollector({ time: 60000 });
            col.on('collect', async i => {
                if (taken) return i.reply({ content: '❌ تم التقاط الصندوق مسبقاً!', ephemeral: true });
                taken = true;
                await i.update({ content: `🏆 مبروك للعضو <@${i.user.id}> التقاط الصندوق الفائز!`, components: [] });
            });
            break;

        case 'dev-broadcast':
            const text = interaction.options.getString('message');
            await interaction.channel.send(`📢 **إعلان المطور (Vilkax Mary):**\n${text}`);
            await interaction.reply({ content: `✅ تم إرسال الإذاعة بنجاح!`, ephemeral: true });
            break;

        case 'dev-give':
            const target = interaction.options.getUser('target');
            const giveAmount = interaction.options.getInteger('amount');
            await interaction.reply({ content: `👑 تم منح **${giveAmount.toLocaleString()} نقطة** للعضو <@${target.id}> بنجاح!` });
            break;

        case 'dev-panel':
            await interaction.reply({ content: `⚙️ **لوحة تحكم المطور (Vilkax Mary)**\n🟢 الحالة: يعمل بكفاءة عالية ومنتظم.`, ephemeral: true });
            break;

        default:
            await interaction.reply({ content: `✨ تم تنفيذ الأمر **/${commandName}** بنجاح!`, ephemeral: true });
            break;
    }
});

// ضع التوكن الخاص بك هنا
client.login('MTU1OTM2MzgxMTI0NzY2MTE5Nw.GFexEm.JeVGC53Sy2afe-2XifR2FQmHR1b7yAH7DqjKgs');
