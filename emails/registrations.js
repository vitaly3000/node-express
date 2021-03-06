const keys = require('../keys');

module.exports = function (email) {
  return {
    from: 'Магазин курсов by Vitaly <blabla@gmail.com>',
    to: email,
    subject: 'Аккаунт создан',
    html: `
    <h1>Добро пожаловать</h1>
    <p>Вы успешно создали аккаунт с email- ${email}</p>
    <hr/>
    <a href='${keys.BASE_URL}'>Магазин</a>
    `,
  };
};
