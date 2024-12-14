import { useState } from 'react';
import "../styles/PokemonFetcher.scss";

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
            setAPIPokemonName(data.name); // Set the fetched Pokémon's name

            // Fetch and display the Pokémon's statistics
            let pokemonStats = data.stats;
            let statistics = "";

            // Loop through the statistics array and format them for display
            for (let position in pokemonStats) {
                // Format the statistics for display
                statistics = statistics.concat(`${pokemonStats[position].stat.name}: ${pokemonStats[position].base_stat} \n`);
            }
            // Update the state with the formatted statistics
            setPokemonStats(statistics);

        } catch (err) {
            console.error(err); // Log the error to the console
            setError('Pokemon not found or an error occurred.'); // Update error state
            setPokemonSprite(null); // Reset the sprite URL
        }
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload on form submission
        fetchPokemon(); // Call the fetch function
    };

    return (
        <div className="grid-container">
            <h1 className="main-title">Hello, Trainer! Ready to Find a Pokémon?</h1>

            {/* Form to accept user input for Pokemon name */}
            <form onSubmit={handleSubmit}>
                {/* // Update state with user input */}
                <input type="text" placeholder="Enter Pokemon name" value={pokemonName} onChange={(e) => setPokemonName(e.target.value)} />
                <button type="submit" className="btn-search">Fetch Pokemon</button>
            </form>

            {/* Display error message if any */}
            {error && <p className="p-error-msg">{error}</p>}

            {/* Display the fetched Pokemon sprite */}
            {pokemonSprite && (
                <div className="pokemon-container">
                    <div>
                        <p>Pokémon name: {APIPokemonName}</p>
                        <p>Statistics</p>
                        <p className="teste"> {pokemonStats}</p>
                    </div>
                    <img src={pokemonSprite} alt={`Sprite of ${pokemonName}`} className="img-container" />
                </div>
            )}
        </div>
    );
}

export default PokemonFetcher;
