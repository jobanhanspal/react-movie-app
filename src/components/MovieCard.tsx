interface Movie{
    title: string;
    vote_average: number;
    poster_path: string | null;
    release_date: string;
    original_language: string;
}

interface MovieCardProps{
    movie: Movie;
}

const MovieCard = ({ movie }:MovieCardProps) => {
     const {
        title,
        vote_average,
        poster_path,
        release_date,
        original_language
    } = movie;

  return (
    <div className="movie-card">

      <img
        src={
          poster_path
            ? `https://image.tmdb.org/t/p/w500${poster_path}`
            : '/no-movie.png'
        }
        alt={title || 'Movie poster'}
        loading="lazy"
      />

      <div className="mt-4">
        <h3>{title || 'Untitled Movie'}</h3>

        <div className="content">

          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>
              {vote_average
                ? vote_average.toFixed(1)
                : 'N/A'}
            </p>
          </div>

          <span>|</span>

          <p className="lang uppercase">
            {original_language || 'N/A'}
          </p>

          <span>|</span>

          <p className="year">
            {release_date
              ? release_date.split('-')[0]
              : 'N/A'}
          </p>

        </div>
      </div>

    </div>
  );
};

export default MovieCard;
