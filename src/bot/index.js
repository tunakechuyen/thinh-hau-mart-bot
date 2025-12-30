const { Telegraf } = require('telegraf');
const Product = require('../models/product');

const setupBot = () => {
    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    bot.start((ctx) => ctx.reply('Chào mừng bạn đến với Thịnh Hậu Mart! Hãy nhập tên sản phẩm để kiểm tra giá.'));

    bot.on('text', async (ctx) => {
        const query = ctx.message.text.trim();
        if (!query) return;

        try {
            // Escape special regex characters to avoid errors
            const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(safeQuery, 'i');

            const products = await Product.find({
                isActive: true,
                $or: [
                    { name: { $regex: searchRegex } },
                    { keywords: { $elemMatch: { $regex: searchRegex } } }
                ]
            }).limit(15);

            if (products.length === 0) {
                return ctx.reply('Không tìm thấy sản phẩm nào.');
            }

            let message = `Tìm thấy ${products.length} sản phẩm:\n\n`;
            products.forEach(p => {
                const unitStr = p.unit ? ` / ${p.unit}` : '';
                // Formatting price: 1000 -> 1,000
                const formattedPrice = p.price.toLocaleString();
                message += `💰 ${p.name}: ${formattedPrice} VND${unitStr}\n`;
            });

            ctx.reply(message);
        } catch (err) {
            console.error('Bot Search Error:', err);
            ctx.reply('Có lỗi xảy ra khi tìm kiếm.');
        }
    });

    bot.launch().then(() => {
        console.log('Telegram Bot started');
    }).catch(err => {
        console.error('Telegram Bot launch failed:', err);
    });

    // Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

    return bot;
};

module.exports = setupBot;
