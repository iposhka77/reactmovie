// server/routes/movies.js

const express = require('express');
const Movie = require('../models/Movie');
const router = express.Router();

// Получение всех фильмов
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);  // Возвращаем все фильмы
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Получение фильма по ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Добавление комментария к фильму
router.post('/:id/comment', async (req, res) => {
  try {
    const { comment } = req.body;
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    movie.comments.push(comment);
    await movie.save();
    res.json(movie.comments);  // Возвращаем обновленный список комментариев
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Обновление рейтинга фильма
router.post('/:id/rating', async (req, res) => {
  try {
    const { rating, userId } = req.body;
    const movie = await Movie.findById(req.params.id);

    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Проверка, ставил ли пользователь уже рейтинг
    const existingRating = movie.userRatings.find((r) => r.userId === userId);
    if (existingRating) {
      return res.status(400).json({ message: 'You already rated this movie' });
    }

    // Добавляем новый рейтинг
    movie.userRatings.push({ userId, rating });
    movie.ratingsCount += 1;

    // Пересчитываем средний рейтинг
    const totalRating = movie.userRatings.reduce((acc, val) => acc + val.rating, 0);
    movie.rating = totalRating / movie.ratingsCount;

    await movie.save();
    res.json(movie);  // Возвращаем фильм с обновленным рейтингом
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
