import nodemailer from 'nodemailer';

// Настройка "транспортера" для Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export async function sendResetEmail(email: string, token: string) {
  // Формируем ссылку: http://localhost:3000/reset-password/ТОКЕН
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: '"AviaApp Support" <no-reply@aviaapp.com>', // Красивое имя отправителя
    to: email, // Кому отправляем
    subject: 'Сброс пароля', // Тема письма
    // HTML тело письма
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
}