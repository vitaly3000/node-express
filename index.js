const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const exphbs = require('express-handlebars');
const csrf = require('csurf');
const flash = require('connect-flash');
const homeRoutes = require('./routes/home');
const addRoutes = require('./routes/add');
const profileRoutes = require('./routes/profile');
const coursesRoutes = require('./routes/courses');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const keys = require('./keys');
const errorHandler = require('./middleware/error');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const fileMiddleware = require('./middleware/file');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');

const app = express();
const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI,
});
const PORT = process.env.PORT || 3000;
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs-helpers'),
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  }),
);
app.use(fileMiddleware.single('avatar'));
app.use(csrf());
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);
app.use('/', homeRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
//  `mongodb+srv://vitaly:a6j3jV34sw1Widwg@cluster0.eomvv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
app.use(errorHandler);
async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`SERVER IS RUNNING ON PORT: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}
start();
