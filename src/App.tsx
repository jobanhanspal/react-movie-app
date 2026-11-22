
import { useEffect, useState } from 'react';
import Search from './components/Search';
import MovieCard from './components/MovieCard';
import Spinner from './components/Spinner';
import './index.css';
import { useDebounce } from 'react-use';

// Movie type from TMDB
interface Movie {
    id: number;
    title: string;
    vote_average: number;
    poster_path: string | null;
    release_date: string;
    original_language: string;
}

// Trending movie type from MySQL
interface TrendingMovie {
    movie_id: number;
    search_term: string;
    poster_url: string | null;
    search_count: number;
}

// TMDB response type
interface TMDBResponse {
    results: Movie[];
}

// Backend response type
interface TrendingResponse {
    success: boolean;
    results: TrendingMovie[];
}

const API_BASE_URL = 'https://api.themoviedb.org/3';
const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS: RequestInit = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
};

const App = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [moviesList, setMoviesList] = useState<Movie[]>([]);
    const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useDebounce(
        () => setDebouncedSearchTerm(searchTerm),
        500,
        [searchTerm]
    );

    // Fetch trending movies
    const fetchTrendingMovies = async (): Promise<void> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/trending`);

            if (!response.ok) {
                throw new Error('Trending API failed');
            }

            const data: TrendingResponse = await response.json();

            setTrendingMovies(data.results || []);

        } catch (error) {
            console.error('TRENDING ERROR:', error);
        }
    };

    // Save movie searches to Hostinger
    const recordMovieSearch = async (
        movie: Movie,
        searchQuery: string
    ): Promise<boolean> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    movie_id: movie.id,
                    search_term: movie.title,
                    poster_url: movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Search tracking failed');
            }

            console.log(
                `Saved ${movie.title} for search "${searchQuery}"`
            );

            return true;

        } catch (error) {
            console.error('SAVE ERROR:', error);
            return false;
        }
    };

    // Fetch movies from TMDB
    const fetchMovies = async (query: string = ''): Promise<void> => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query.trim()
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data: TMDBResponse = await response.json();
            const results: Movie[] = data.results || [];

            setMoviesList(results);

            // Track results only for actual searches
            if (query.trim() && results.length > 0) {
                const savedResults = await Promise.all(
                    results.map((movie: Movie) =>
                        recordMovieSearch(movie, query)
                    )
                );

                if (savedResults.some(Boolean)) {
                    await fetchTrendingMovies();
                }
            }

        } catch (error) {
            console.error('FETCH ERROR:', error);

            setErrorMessage(
                'Error fetching movies. Please try again later.'
            );

            setMoviesList([]);

        } finally {
            setIsLoading(false);
        }
    };

    // Initial trending fetch
    useEffect(() => {
        void fetchTrendingMovies();
    }, []);

    // Search movies after typing stops
    useEffect(() => {
        void fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    return (
        <>
            <div className="pattern" />

            <div className="wrapper">

                <header>
                    <img src="./hero.png" alt="hero" />

                    <h1>
                        Find <span className="text-gradient">Movies</span>
                        {' '}You'll Enjoy Without the Hassle
                    </h1>

                    <Search
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </header>

                
                {/* Trending Movies */}
                <section className="trending">
                    <h2>Trending Movies</h2>

                    {trendingMovies.length === 0 ? (
                        <p>No trending movies yet. Start searching!</p>
                    ) : (
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.movie_id}>
                                    <p className="text-transparent">{index + 1}</p>

                                    <img
                                        src={
                                            movie.poster_url ||
                                            '/no-movie.png'
                                        }
                                        alt={movie.search_term}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>


                {/* All Movies */}
                <section className="all-movies">

                    <h2>All Movies</h2>

                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-900">
                            {errorMessage}
                        </p>
                    ) : (
                        <ul>
                            {moviesList.map((movie) => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                />
                            ))}
                        </ul>
                    )}

                </section>

            </div>
        </>
    );
};

export default App;
