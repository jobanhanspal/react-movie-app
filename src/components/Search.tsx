type searchType = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}
const Search = ({searchTerm, setSearchTerm}:searchType) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search" />

        <input 
          type="text"
          placeholder="Search through thousand movies"
          value={searchTerm}
          onChange={(e)=> setSearchTerm(e.target.value)} />
      </div>
    </div>
  )
}

export default Search