const mongoose = require('mongoose');

// Создание схемы для фильма
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true }, // URL картинки
  description: { type: String, required: true }, // Краткое описание
  rating: { type: Number, required: true, min: 0, max: 10 }, // Рейтинг фильма
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
