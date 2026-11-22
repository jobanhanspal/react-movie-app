import { useEffect, useState } from 'react'
import Search from './components/Search'
import './index.css'
import MovieCard from './components/MovieCard';
import Spinner from './components/Spinner';
import { useDebounce } from 'react-use';

interface movie {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string | null;
  release_date: string;
  original_language: string;
}

interface trendingMovies{
  movie_id: number;
  search_term: string;
  poster_url: string | null;
  search_count: number;
}

interface TMDBResponse {
    results: Movie[];
}

interface trendingResponse{
    success: boolean;
    results: TrendingMovie[];
}

const API_BASE_URL = 'https://api.themoviedb.org/3/';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS: RequestInit = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const  App = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [moviesList, setMoviesList] = useState<Movie[]>([]);
    const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useDebounce(() => setDeboundedSearchTerm(searchTerm), 500, [searchTerm]);

    const fetchMovies = async (query = '') => {

      setIsLoading(true);
      setErrorMessage('');
      try {
        const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
        const response = await fetch(endpoint, API_OPTIONS);

        if(!response.ok){
        throw new Error('Failed to fetch movies');
        }
        
        const data = await response.json();
        console.log(data);
        
        if (data.response === 'False'){
          setErrorMessage(data.Error || "Failed to fetch Movies");
          setMoviesList([]);
          return;
        }
        setMoviesList(data.results || []);

      } catch(error){
        console.error(`Error fetching movies: ${error}`);
        setErrorMessage('Error featching movies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
   

    useEffect(()=>{
      fetchMovies(debouncedSearchTerm);
    },[debouncedSearchTerm])


  return (
    <>
    <div className="pattern" />
    <div className="wrapper">
      <header>
        <img src="./hero.png" alt="hero" />
        <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

      <section className="all-movies">
        <h2>All Movies</h2>

        {isLoading ? ( <Spinner /> ) : errorMessage ? ( <p className="text-red-900">{errorMessage}</p>) :
        
        (
          <ul>
            {moviesList.map((movie)=>
          ( <MovieCard key={movie.id} movie={movie} /> ))}
          </ul>
        )
        }
      </section>
    </div>
    </>
  )
}

export default App
