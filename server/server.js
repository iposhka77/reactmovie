const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Подключение к базе данных MongoDB
const dbURI = 'mongodb://localhost:27017/movie_reviews';

mongoose.connect(dbURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Модели
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  comments: [{ username: String, comment: String }],
  rating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  userRatings: [{ userId: String, rating: Number }]
});

const Movie = mongoose.model('Movie', movieSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Маршрут для получения всех фильмов
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).send('Ошибка при получении списка фильмов');
  }
});

// Маршрут для получения фильма по ID
app.get('/movie/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findById(id);  // Ищем фильм по ID
    if (!movie) {
      return res.status(404).send('Фильм не найден');
    }
    res.json(movie);
  } catch (err) {
    res.status(500).send('Ошибка при получении фильма');
  }
});

// Маршрут для добавления нового рейтинга
app.post('/movie/:id/rating', async (req, res) => {
  const { id } = req.params;
  const { rating, userId } = req.body;

  try {
    if (rating < 1 || rating > 10) {
      return res.status(400).send('Рейтинг должен быть от 1 до 10');
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).send('Фильм не найден');
    }

    // Проверяем, есть ли уже рейтинг от этого пользователя
    const existingRating = movie.userRatings.find((rating) => rating.userId === userId);
    if (existingRating) {
      existingRating.rating = rating;  // Обновляем рейтинг
    } else {
      movie.userRatings.push({ userId, rating });  // Добавляем новый рейтинг
    }

    // Пересчитываем средний рейтинг
    const totalRating = movie.userRatings.reduce((sum, { rating }) => sum + rating, 0);
    movie.rating = (totalRating / movie.userRatings.length).toFixed(1);  // Округляем до 1 знака после запятой
    movie.ratingsCount = movie.userRatings.length;

    await movie.save();
    res.json(movie);  // Отправляем обновленный фильм

  } catch (err) {
    res.status(500).send('Ошибка при обновлении рейтинга');
  }
});

// Маршрут для добавления комментария
app.post('/movie/:id/comment', async (req, res) => {
  const { id } = req.params;
  const { username, comment } = req.body;

  try {
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).send('Фильм не найден');
    }

    movie.comments.push({ username, comment });
    await movie.save();

    res.json(movie.comments);  // Отправляем обновленные комментарии
  } catch (err) {
    res.status(500).send('Ошибка при добавлении комментария');
  }
});

// Маршрут для регистрации нового пользователя
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка регистрации.' });
  }
});

// Маршрут для входа пользователя
app.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!user) {
      return res.status(400).json({ error: 'Неверное имя пользователя или email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при входе.' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
