import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();  // Получаем ID фильма из URL
  const [movie, setMovie] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [username] = useState(localStorage.getItem('username'));  // Получаем имя пользователя из localStorage

  // Загружаем информацию о фильме и комментариях
  useEffect(() => {
    axios.get(`http://localhost:5000/movie/${id}`)
      .then((response) => {
        setMovie(response.data);
        setComments(response.data.comments || []);
        setUserRating(response.data.userRatings.find((rating) => rating.userId === username)?.rating || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка при получении фильма:', error);
        setLoading(false);
      });

    const savedTheme = localStorage.getItem('theme');
    setIsDarkTheme(savedTheme === 'dark');
  }, [id, username]);

  // Функция для переключения темы
  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setIsDarkTheme(!isDarkTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Обработчик изменения рейтинга
  const handleRatingChange = (newRating) => {
    if (newRating < 1 || newRating > 10) {
      alert('Рейтинг должен быть от 1 до 10');
      return;
    }

    axios.post(`http://localhost:5000/movie/${id}/rating`, { rating: newRating, userId: username })
      .then((response) => {
        setMovie(response.data);
        setUserRating(newRating);  // Обновляем рейтинг пользователя
      })
      .catch((error) => {
        console.error('Ошибка при обновлении рейтинга:', error);
      });
  };

  // Обработчик отправки комментария
  const handleCommentSubmit = (event) => {
    event.preventDefault();

    if (newComment.trim() === '') {
      alert('Комментарий не может быть пустым!');
      return;
    }

    axios.post(`http://localhost:5000/movie/${id}/comment`, { username, comment: newComment })
      .then((response) => {
        setComments(response.data);
        setNewComment('');
      })
      .catch((error) => {
        console.error('Ошибка при добавлении комментария:', error);
      });
  };

  if (loading) return <div className="loading-indicator">Загрузка...</div>;

  if (!movie) return <p>Фильм не найден</p>;

  return (
    <div className={`movie-detail-container ${isDarkTheme ? 'dark-theme' : ''}`}>
      <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Переключить тему">
        {isDarkTheme ? 'Светлая тема' : 'Темная тема'}
      </button>

      <div className="movie-detail-header">
        <div className="movie-detail-image-container">
          <img src={movie.image} alt={movie.title} className="movie-detail-image" />
        </div>
        <div className="movie-detail-info">
          <h1>{movie.title}</h1>
          <p>{movie.description}</p>

          <div className="movie-rating-container">
            <div className="rating-text">
              <span>Рейтинг: {movie.rating}</span>
            </div>
            <div className="rating-numbers">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  className={`rating-btn ${userRating === num ? 'user-rated' : ''}`}
                  onClick={() => handleRatingChange(num)}
                  aria-label={`Оценить фильм на ${num} звезды`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="movie-comments">
        <h2>Отзывы ({comments.length})</h2>
        <ul>
          {comments.map((comment, index) => (
            <li key={index}>
              <strong>{comment.username}</strong>: {comment.comment}
            </li>
          ))}
        </ul>

        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Напишите ваш комментарий..."
          ></textarea>
          <button type="submit">Отправить комментарий</button>
        </form>
      </div>
    </div>
  );
};

export default MovieDetail;
