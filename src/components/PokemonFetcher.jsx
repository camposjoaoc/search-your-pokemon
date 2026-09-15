import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import '../sass/pokemonFetcher.scss';
import logoPokemon from '../assets/img-pokemon-logo.png';
import PokemonCard from './PokemonCard';
import PokemonOfTheDay from './PokemonOfTheDay';
import SearchBox from './SearchBox';
import WhosThatPokemon from './WhosThatPokemon';
import { API_URL, fetchJson, readCache, writeCache } from '../utils/api';
import { playFoundAudio } from '../utils/audio';
import { FIRST_ALTERNATE_FORM_ID, buildPokemon, getIdFromUrl, normalizeSearchQuery } from '../utils/pokemon';

// Used for the random button if the Pokémon list couldn't be loaded
const FALLBACK_SPECIES_COUNT = 1025;

// The list of names rarely changes, so it's cached for a week
const POKEMON_LIST_CACHE_KEY = 'pokemonList';
const POKEMON_LIST_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

// Spinning Pokéball shown while a search is in progress
function LoadingStatus() {
    return (
        <div className="loading-status">
            <span className="pokeball-spinner" aria-hidden="true" />
            Searching...
        </div>
    );
}

function PokemonFetcher() {
    // State to store the fetched Pokémon shown on the card
    const [pokemon, setPokemon] = useState(null);
    // State to store any error messages
    const [error, setError] = useState(null);
    // State to show that a search is in progress
    const [isLoading, setIsLoading] = useState(false);
    // State to store every Pokémon name and id, used by the autocomplete, the random button and the quiz
    const [pokemonList, setPokemonList] = useState([]);
    // Id of the latest search, so slower older responses don't overwrite newer ones
    const latestRequestId = useRef(0);
    // Name (as in the URL) of the Pokémon on screen, so the URL effect doesn't fetch it again
    const loadedPokemonName = useRef(null);

    // The Pokémon in the URL (?pokemon=snorlax), so searches can be shared and navigated with back/forward
    const [searchParams, setSearchParams] = useSearchParams();
    const pokemonParam = searchParams.get('pokemon');

    // Function to fetch Pokemon data from the API, by name or Pokédex number. Resolves to true when it's shown
    const fetchPokemon = async (nameOrId, { fromUrl = false } = {}) => {
        const requestId = ++latestRequestId.current;
        setError(null); // Reset error state before fetching
        setIsLoading(true);

        try {
            const data = await fetchJson(`${API_URL}/pokemon/${encodeURIComponent(nameOrId)}`);

            // Extra details are optional: the card still shows if any of these requests fail
            const [species, typeDetails] = await Promise.all([
                fetchJson(data.species.url).catch(() => null),
                Promise.all(data.types.map(({ type }) => fetchJson(type.url))).catch(() => null),
            ]);
            const evolutionChain = species?.evolution_chain
                ? await fetchJson(species.evolution_chain.url).catch(() => null)
                : null;

            if (requestId !== latestRequestId.current) return false; // A newer search has started

            const fetchedPokemon = buildPokemon(data, species, typeDetails, evolutionChain);
            if (!fetchedPokemon.sprite) {
                throw new Error('No sprite available');
            }

            setPokemon(fetchedPokemon);
            loadedPokemonName.current = data.name;
            // New searches add a history entry; links opened by number (?pokemon=25) are rewritten to the name
            if (pokemonParam !== data.name) {
                setSearchParams({ pokemon: data.name }, { replace: fromUrl });
            }
            playFoundAudio(fetchedPokemon.cry); // Play on every successful search, even when repeating the same Pokémon
            return true;

        } catch (err) {
            if (requestId !== latestRequestId.current) return false; // A newer search has started
            console.error(err); // Log the error to the console
            setError('Pokemon not found or an error occurred. Try Again!'); // Update error state
            setPokemon(null); // Hide the previous Pokémon
            return false;
        } finally {
            if (requestId === latestRequestId.current) {
                setIsLoading(false);
            }
        }
    };

    // Load every Pokémon name once (or from the cache); if it fails, searching still works without suggestions
    useEffect(() => {
        const cachedList = readCache(POKEMON_LIST_CACHE_KEY, POKEMON_LIST_MAX_AGE);
        if (cachedList) {
            setPokemonList(cachedList);
            return;
        }

        fetchJson(`${API_URL}/pokemon?limit=100000`)
            .then(({ results }) => {
                const list = results.map(({ name, url }) => ({ name, id: getIdFromUrl(url) }));
                setPokemonList(list);
                writeCache(POKEMON_LIST_CACHE_KEY, list);
            })
            .catch((err) => console.error('Could not load the Pokémon list:', err));
    }, []);

    // Show the Pokémon from the URL when the page opens or the user navigates back/forward
    useEffect(() => {
        if (!pokemonParam) {
            latestRequestId.current++; // Ignore any search still in progress
            loadedPokemonName.current = null;
            setPokemon(null);
            setError(null);
            setIsLoading(false);
            return;
        }

        if (pokemonParam !== loadedPokemonName.current) {
            fetchPokemon(normalizeSearchQuery(pokemonParam), { fromUrl: true });
        }
        // Only react to URL changes; fetchPokemon is recreated on every render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pokemonParam]);

    // Function to handle a search from the search box (typed text or a picked suggestion)
    const handleSearch = (query) => {
        const nameOrNumber = normalizeSearchQuery(query);
        if (!nameOrNumber) return Promise.resolve(false); // Ignore empty searches
        return fetchPokemon(nameOrNumber); // Call the fetch function
    };

    // Function to show a random Pokémon (default forms only)
    const handleRandom = () => {
        const species = pokemonList.filter(({ id }) => id < FIRST_ALTERNATE_FORM_ID);
        const randomPokemon = species.length > 0
            ? species[Math.floor(Math.random() * species.length)].name
            : Math.floor(Math.random() * FALLBACK_SPECIES_COUNT) + 1;
        return fetchPokemon(randomPokemon);
    };

    return (
        <div className="container">
            <div className="grid-container">
                {/* The logo goes back to the home page and its widgets */}
                <Link to="/" className="logo-link" aria-label="Go to home page">
                    <img src={logoPokemon} alt="" className='img-logo animate__animated animate__pulse animate__infinite' />
                </Link>
                <h1 className="primary-title">Hello, Trainer! Ready to Find a Pokémon?</h1>

                <SearchBox
                    pokemonList={pokemonList}
                    onSearch={handleSearch}
                    onRandom={handleRandom}
                    isLoading={isLoading}
                />

                <div>
                    <h4 className="help-info">Need Help? Look this <a href="https://www.pokemon.com/us/pokedex" target="_blank" rel="noopener noreferrer">list</a> of Pokémons!</h4>
                </div>

                {/* Announce loading and errors to screen readers */}
                <div className="status-area" role="status" aria-live="polite">
                    {isLoading && !pokemon && <LoadingStatus />}
                    {error && <p className="p-error-msg">{error}</p>}
                </div>

                {/* Home widgets are hidden (not unmounted) while a Pokémon is shown, so the quiz keeps its streak */}
                <div className="home-widgets" hidden={Boolean(pokemon)}>
                    <PokemonOfTheDay onSelectPokemon={fetchPokemon} />
                    <WhosThatPokemon pokemonList={pokemonList} onSelectPokemon={fetchPokemon} />
                </div>

                {/* Display the fetched Pokemon card, dimmed while the next one loads (e.g. clicking an evolution) */}
                {pokemon && (
                    <div className={`card-wrapper ${isLoading ? 'is-loading' : ''}`} aria-busy={isLoading}>
                        {/* The key resets the shiny toggle and replays the entrance animation */}
                        <PokemonCard key={pokemon.id} pokemon={pokemon} onSelectPokemon={fetchPokemon} />
                        {isLoading && (
                            <div className="card-loading-overlay">
                                <LoadingStatus />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PokemonFetcher;
