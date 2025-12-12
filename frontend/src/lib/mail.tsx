import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Включаем подробные логи самого nodemailer для отладки
  debug: true, 
  logger: true 
});

export async function sendResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  console.log(`[Email Service] 🚀 Начинаем отправку письма на: ${email}`);
  
  // ЛАЙФХАК: Выводим ссылку в консоль сервера. 
  // Если почта не настроена, вы сможете скопировать ссылку прямо из терминала.
  console.log(`[Email Service] 🔗 Ссылка для сброса (DEV): ${resetLink}`);

  try {
    // Проверка переменных окружения
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("❌ Ошибка: Не заполнены EMAIL_USER или EMAIL_PASS в .env");
    }

    const info = await transporter.sendMail({
      from: '"AviaApp Support" <aviaapp.service24@gmail.com>',
      to: email,
      subject: 'Сброс пароля',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>Восстановление пароля</h1>
          <p>Вы запросили сброс пароля.</p>
          <p>Нажмите на кнопку ниже, чтобы придумать новый пароль:</p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Сбросить пароль</a>
          <p style="margin-top: 20px; font-size: 12px; color: gray;">Ссылка действительна 1 час.</p>
        </div>
      `,
    });

    console.log(`[Email Service] ✅ Письмо успешно отправлено!`);
    console.log(`[Email Service] 🆔 Message ID: ${info.messageId}`);
    console.log(`[Email Service] 📨 Response: ${info.response}`);

    return info;

  } catch (error) {
    console.error(`[Email Service] ❌ ОШИБКА ОТПРАВКИ:`, error);
    // Пробрасываем ошибку дальше, чтобы UI узнал о ней
    throw new Error('Не удалось отправить письмо. Проверьте логи сервера.');
  }
}