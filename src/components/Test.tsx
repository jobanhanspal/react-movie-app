
import { useEffect } from 'react';

function TestAPI() {
  useEffect(() => {
    const testAPI = async () => {
      const API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMWVlMDA2M2E2Y2M0ODJiZjdmMDFkNmQwYzFmN2U2OSIsIm5iZiI6MTc5Mzk5NDU0My4zOTIsInN1YiI6IjZhZWUyZjJmNDU3ZTdhYjcyMWJhN2JiMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.T11cq1zBuAi6FaBTYpY5nrsiKATkTxI7soLfn93__C4';

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}`
        );

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', data);

        if (response.ok) {
          console.log('SUCCESS! Movies:', data.results);
        } else {
          console.log('API ERROR:', data.status_message);
        }

      } catch (error) {
        console.error('Network error:', error);
      }
    };

    testAPI();
  }, []);

  return <h2>Testing TMDB API...</h2>;
}

export default TestAPI;
