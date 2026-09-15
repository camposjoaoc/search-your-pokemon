import { useEffect, useState } from 'react';
import '../sass/homeWidgets.scss';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { API_URL, fetchJson, readCache, writeCache } from '../utils/api';
import { buildPokemon, formatName, formatPokedexNumber } from '../utils/pokemon';

// Pokémon the daily pick rotates through. Fixed, so everyone sees the same one on the same day
const DAILY_POKEMON_COUNT = 1025;
// Versioned, so days cached before animated sprites existed are fetched again
const CACHE_KEY = 'pokemonOfTheDay-v2';

// Local date like "2026-09-15"
function getTodayKey() {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
}

// Pokédex number for a day: multiplying by a prime visits every Pokémon once before repeating
function getDailyPokemonId(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86400000);
    return ((dayNumber * 7919) % DAILY_POKEMON_COUNT) + 1;
}

// Home widget with a different Pokémon every day, cached until the day changes
function PokemonOfTheDay({ onSelectPokemon }) {
    const [pokemon, setPokemon] = useState(null);
    const [hasError, setHasError] = useState(false);
    // Show the animated GIF unless the user prefers reduced motion
    const prefersReducedMotion = usePrefersReducedMotion();
    const showAnimated = Boolean(pokemon?.animatedSprite) && !prefersReducedMotion;

    useEffect(() => {
        const today = getTodayKey();
        const cached = readCache(CACHE_KEY);
        if (cached?.date === today) {
            setPokemon(cached.pokemon);
            return;
        }

        let ignore = false;
        const id = getDailyPokemonId(today);
        Promise.all([fetchJson(`${API_URL}/pokemon/${id}`), fetchJson(`${API_URL}/pokemon-species/${id}`)])
            .then(([data, species]) => {
                const dailyPokemon = buildPokemon(data, species, null, null);
                writeCache(CACHE_KEY, { date: today, pokemon: dailyPokemon });
                if (!ignore) setPokemon(dailyPokemon);
            })
            .catch((err) => {
                console.error("Could not load the Pokémon of the day:", err);
                if (!ignore) setHasError(true);
            });

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <section
            className={`widget pokemon-of-the-day ${pokemon ? `type-${pokemon.types[0]}` : ''}`}
            aria-labelledby="pokemon-of-the-day-title"
        >
            <h2 id="pokemon-of-the-day-title" className="widget-title">
                <span aria-hidden="true">📅</span> Pokémon of the Day
            </h2>

            {hasError && <p className="widget-message">Couldn&apos;t load today&apos;s Pokémon. Try again later!</p>}

            {!pokemon && !hasError && (
                <div className="widget-message">
                    <span className="pokeball-spinner" aria-hidden="true" />
                    Loading...
                </div>
            )}

            {pokemon && (
                <>
                    <div className="widget-image">
                        <img
                            src={showAnimated ? pokemon.animatedSprite : pokemon.sprite}
                            alt={`Sprite of ${pokemon.name}`}
                            className={showAnimated ? 'is-animated' : ''}
                        />
                    </div>

                    <div className="daily-header">
                        <h3 className="daily-name">{pokemon.name}</h3>
                        <span className="daily-number">{formatPokedexNumber(pokemon.id)}</span>
                    </div>
                    {pokemon.genus && <p className="daily-genus">{pokemon.genus}</p>}

                    <ul className="badge-list">
                        {pokemon.types.map((type) => (
                            <li key={type} className={`type-badge type-${type}`}>{formatName(type)}</li>
                        ))}
                    </ul>

                    {pokemon.description && <p className="daily-description">{pokemon.description}</p>}

                    <button type="button" className="widget-button" onClick={() => onSelectPokemon(pokemon.id)}>
                        See details →
                    </button>
                </>
            )}
        </section>
    );
}

export default PokemonOfTheDay;
