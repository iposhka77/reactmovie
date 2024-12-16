import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/MovieList.css';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [rating, setRating] = useState('');
  const username = localStorage.getItem('username'); // Получаем имя пользователя из localStorage

  useEffect(() => {
    axios.get('http://localhost:5000/movies')
      .then(response => setMovies(response.data))
      .catch(error => console.error('Ошибка при получении списка фильмов:', error));
  }, []);

  const filteredMovies = rating
    ? movies.filter(movie => movie.rating >= rating)
    : movies;

  return (
    <div className="movie-list-page">
      <header className="header">
        <div className="logo">Movie Rank</div>
        <div className="navigation">
          {username ? (
            <span>Привет, {username}</span> // Показываем приветствие с ником
          ) : (
            <>
              <Link to="/register">Регистрация</Link>
              <Link to="/login">Вход</Link>
            </>
          )}
        </div>

        <div className="rating-filter">
          <label htmlFor="rating" className="rating-label">Рейтинг:</label>
          <select
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="rating-select"
            aria-label="Фильтрация по рейтингу"
          >
            <option value="">Все</option>
            {[...Array(10)].map((_, i) => (
              <option key={i} value={i + 1}>{i + 1}+</option>
            ))}
          </select>
        </div>
      </header>

      <div className="movie-list-container">
        {filteredMovies.length === 0 ? (
          <div className="no-movies"></div>
        ) : (
          filteredMovies.map((movie) => (
            <div className="movie-card" key={movie._id}>
              <Link to={`/movie/${movie._id}`} className="movie-card-link" aria-label={`Перейти к фильму ${movie.title}`}>
                <div className="movie-rating-circle">{movie.rating}</div>
                <img src={movie.image} alt={movie.title} className="movie-image" />
                <div className="movie-info">
                  <div className="movie-title">{movie.title}</div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MovieList;
