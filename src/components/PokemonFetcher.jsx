import { useState, useEffect } from 'react';
import '../sass/PokemonFetcher.scss';
import logoPokemon from '../assets/img-pokemon-logo.png';
import myAudio from '../assets/audio/pokemon-found.mp3';

//Capitalize the first letter
function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
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
    const fetchPokemon = async () => {
        try {
            setError(null); // Reset error state before fetching
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);

            if (!response.ok) {
                throw new Error('Could not fetch resource'); // Handle non-successful responses
            }

            const data = await response.json();
            setPokemonSprite(data.sprites.other.dream_world.front_default); // Set the sprite URL
            setAPIPokemonName(capitalizeFirstLetter(data.name)); // Set the fetched Pokémon's name
            setPokemonName(""); // Clear input

            // Fetch and display the Pokémon's statistics
            let pokemonStats = data.stats;
            let statistics = "";
            const emoji = "⚡";

            // Loop through the statistics array and format them for display
            for (let position in pokemonStats) {
                // Format the statistics for display
                statistics = statistics.concat(`${emoji}${capitalizeFirstLetter(pokemonStats[position].stat.name)}: ${pokemonStats[position].base_stat}\n`);
            }
            // Update the state with the formatted statistics
            setPokemonStats(statistics);

        } catch (err) {
            console.error(err); // Log the error to the console
            setError('Pokemon not found or an error occurred. Try Again!'); // Update error state
            setPokemonSprite(null); // Reset the sprite URL
        }
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload on form submission
        fetchPokemon(); // Call the fetch function
    };

    // Function to play the audio when the sprite is loaded
    useEffect(() => {
        if (pokemonSprite) {
            const audioPlayer = new Audio(myAudio); 
            audioPlayer.play().catch((error) => {
                console.error('Error playing audio:', error);
            });
        }
    }, [pokemonSprite]);

    return (
        <div className="grid-container">
            <img src={logoPokemon} alt="Pokemon Logo" className='img-logo animate__animated animate__pulse animate__infinite' />
            <h1 className="primary-title">Hello, Trainer! Ready to Find a Pokémon?</h1>

            <div className='search-box'>
                {/* Form to accept user input for Pokemon name */}
                <form onSubmit={handleSubmit}>
                    {/* // Update state with user input */}
                    <input className="input-style" type="text" placeholder="Enter Pokémon name" value={pokemonName} onChange={(e) => setPokemonName(e.target.value)} />
                    <button type="submit" className="btn-search">FIND POKÉMON <i className="fas fa-search"></i> </button>
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
                        <p className="p-info">Pokémon: {APIPokemonName}</p>
                        <p className="p-info">--Statistics--</p>
                        <p className="p-info"> {pokemonStats}</p>
                    </div>
                    <div className="img-container">
                        <img src={pokemonSprite} alt={`Sprite of ${pokemonName}`} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default PokemonFetcher;
