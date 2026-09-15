import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '../sass/pokemonFetcher.scss';
import logoPokemon from '../assets/img-pokemon-logo.png';
import myAudio from '../assets/audio/pokemon-found.mp3';

//Capitalize the first letter
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

// Play the "Pokémon found" sound
function playFoundAudio() {
    const audioPlayer = new Audio(myAudio);
    audioPlayer.play().catch((error) => {
        console.error('Error playing audio:', error);
    });
}

function PokemonFetcher() {
    // State to store the name of the Pokemon entered by the user
    const [pokemonName, setPokemonName] = useState('');
    // State to store the sprite (image) URL of the fetched Pokemon
    const [pokemonSprite, setPokemonSprite] = useState(null);
    // State to store any error messages
    const [error, setError] = useState(null);
    // State to store the fetched Pokémon's name
    const [APIPokemonName, setAPIPokemonName] = useState('');
    // State to store the fetched Pokémon's status
    const [pokemonStats, setPokemonStats] = useState('');

    // Function to fetch Pokemon data from the API
    const fetchPokemon = async (name) => {
        try {
            setError(null); // Reset error state before fetching
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);

            if (!response.ok) {
                throw new Error('Could not fetch resource'); // Handle non-successful responses
            }

            const data = await response.json();
            // Not every Pokémon (e.g. Mega forms) has a Dream World sprite, so fall back to other artwork
            const sprite =
                data.sprites.other.dream_world.front_default ??
                data.sprites.other['official-artwork'].front_default ??
                data.sprites.front_default;

            if (!sprite) {
                throw new Error('No sprite available');
            }

            setPokemonSprite(sprite); // Set the sprite URL
            setAPIPokemonName(capitalizeFirstLetter(data.name)); // Set the fetched Pokémon's name
            setPokemonName(""); // Clear input

            // Format the Pokémon's statistics for display
            const emoji = "⚡";
            const statistics = data.stats
                .map(({ stat, base_stat }) => `${emoji}${capitalizeFirstLetter(stat.name)}: ${base_stat}\n`)
                .join('');
            // Update the state with the formatted statistics
            setPokemonStats(statistics);

            playFoundAudio(); // Play on every successful search, even when repeating the same Pokémon

        } catch (err) {
            console.error(err); // Log the error to the console
            setError('Pokemon not found or an error occurred. Try Again!'); // Update error state
            setPokemonSprite(null); // Reset the sprite URL
        }
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload on form submission
        const name = pokemonName.trim().toLowerCase();
        if (!name) return; // Ignore empty searches
        fetchPokemon(name); // Call the fetch function
    };

    return (
        <div className="container">
            <div className="grid-container">
                <img src={logoPokemon} alt="Pokemon Logo" className='img-logo animate__animated animate__pulse animate__infinite' />
                <h1 className="primary-title">Hello, Trainer! Ready to Find a Pokémon?</h1>

                <div className='search-box'>
                    {/* Form to accept user input for Pokemon name */}
                    <form onSubmit={handleSubmit}>
                        {/* // Update state with user input */}
                        <input className="input-style" type="text" placeholder="Enter Pokémon name: Pikachu, Charizard, Snorlax, Blastoise..." value={pokemonName} onChange={(e) => setPokemonName(e.target.value)} />
                        <button type="submit" className="btn-search">FIND POKÉMON <FontAwesomeIcon icon={faMagnifyingGlass} /> </button>
                    </form>

                </div>
                <div>
                    <h4 className="help-info">Need Help? Look this <a href="https://www.pokemon.com/us/pokedex" target="_blank" rel="noopener noreferrer">list</a> of Pokémons!</h4>
                </div>
                {/* Display error message if any */}
                {error && <p className="p-error-msg">{error}</p>}

                {/* Display the fetched Pokemon sprite */}
                {pokemonSprite && (
                    <div className="pokemon-container">
                        <div>
                            <p className="p-info">{APIPokemonName}</p>
                            <p className="p-info">--Statistics--</p>
                            <p className="p-info"> {pokemonStats}</p>
                        </div>
                        <div className="img-container">
                            <img src={pokemonSprite} alt={`Sprite of ${APIPokemonName}`} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PokemonFetcher;
