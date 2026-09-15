import { Fragment, useState } from 'react';
import '../sass/pokemonCard.scss';
import { FIRST_ALTERNATE_FORM_ID, formatName, formatPokedexNumber, getArtworkUrl } from '../utils/pokemon';

// Highest base stat of any Pokémon, used to scale the stat bars
const MAX_BASE_STAT = 255;

// Short labels for the stat names returned by the API
const STAT_LABELS = {
    hp: 'HP',
    attack: 'Atk',
    defense: 'Def',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
};

// Labels for the damage multipliers of type matchups
const MULTIPLIER_LABELS = {
    4: '×4',
    2: '×2',
    0.5: '×½',
    0.25: '×¼',
    0: '×0',
};

// Class used to color a stat bar according to its value
function getStatLevel(value) {
    if (value < 60) return 'stat-low';
    if (value < 90) return 'stat-medium';
    if (value < 120) return 'stat-high';
    return 'stat-very-high';
}

// One row of type matchups (e.g. "Weak to: Fire ×2"), hidden when empty
function MatchupRow({ label, matchups }) {
    if (matchups.length === 0) return null;

    return (
        <div className="matchup-row">
            <span className="matchup-label">{label}</span>
            <ul className="badge-list">
                {matchups.map(({ type, multiplier }) => (
                    <li key={type} className={`type-badge type-badge-small type-${type}`}>
                        {formatName(type)} <span className="type-multiplier">{MULTIPLIER_LABELS[multiplier]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Card with everything we know about a Pokémon, colored by its main type
function PokemonCard({ pokemon, onSelectPokemon }) {
    // State to toggle between the regular and the shiny artwork
    const [isShiny, setIsShiny] = useState(false);
    // State to toggle the animated GIF (only on request, so nothing moves unless the user asks)
    const [isAnimated, setIsAnimated] = useState(false);

    const hasAnimation = Boolean(pokemon.animatedSprite);
    // Use the animated version when chosen and available, otherwise the still artwork
    const animatedSprite = isShiny ? pokemon.animatedShinySprite : pokemon.animatedSprite;
    const stillSprite = isShiny ? pokemon.shinySprite : pokemon.sprite;
    const showAnimated = isAnimated && Boolean(animatedSprite);

    const totalStats = pokemon.stats.reduce((total, { value }) => total + value, 0);
    const { matchups, evolutionStages } = pokemon;

    return (
        <div className={`pokemon-card type-${pokemon.types[0]} animate__animated animate__fadeInUp`}>
            <div className="pokemon-image">
                <div className="img-container">
                    <img
                        src={showAnimated ? animatedSprite : stillSprite}
                        alt={`${isShiny ? 'Shiny sprite' : 'Sprite'} of ${pokemon.name}`}
                        className={showAnimated ? 'is-animated' : ''}
                    />
                </div>
                <div className="image-toggles">
                    {pokemon.shinySprite && (
                        <button
                            type="button"
                            className={`image-toggle ${isShiny ? 'is-active' : ''}`}
                            aria-pressed={isShiny}
                            onClick={() => setIsShiny((shiny) => !shiny)}
                        >
                            ✨ Shiny
                        </button>
                    )}
                    {hasAnimation && (
                        <button
                            type="button"
                            className={`image-toggle ${isAnimated ? 'is-active' : ''}`}
                            aria-pressed={isAnimated}
                            onClick={() => setIsAnimated((animated) => !animated)}
                        >
                            <span aria-hidden="true">🎞️</span> Animated
                        </button>
                    )}
                </div>
            </div>

            <div className="pokemon-info">
                <div className="pokemon-header">
                    <h2 className="pokemon-name">{pokemon.name}</h2>
                    {pokemon.id < FIRST_ALTERNATE_FORM_ID && (
                        <span className="pokemon-number">{formatPokedexNumber(pokemon.id)}</span>
                    )}
                </div>
                {pokemon.genus && <p className="pokemon-genus">{pokemon.genus}</p>}

                <ul className="badge-list">
                    {pokemon.types.map((type) => (
                        <li key={type} className={`type-badge type-${type}`}>{formatName(type)}</li>
                    ))}
                    {pokemon.isLegendary && <li className="rarity-badge">Legendary</li>}
                    {pokemon.isMythical && <li className="rarity-badge">Mythical</li>}
                </ul>

                <ul className="pokemon-measurements">
                    <li><span className="measurement-label">Height</span>{pokemon.height} m</li>
                    <li><span className="measurement-label">Weight</span>{pokemon.weight} kg</li>
                    {pokemon.generation && (
                        <li><span className="measurement-label">Generation</span>{pokemon.generation}</li>
                    )}
                </ul>
            </div>

            {pokemon.description && <p className="pokemon-description">“{pokemon.description}”</p>}

            <section className="pokemon-stats">
                <h3 className="section-title">Base stats</h3>
                <ul className="stat-list">
                    {pokemon.stats.map(({ name, value }) => (
                        <li key={name} className="stat-row">
                            <span className="stat-name">{STAT_LABELS[name] ?? formatName(name)}</span>
                            <span className="stat-value">{value}</span>
                            <div className="stat-bar" aria-hidden="true">
                                <div
                                    className={`stat-bar-fill ${getStatLevel(value)}`}
                                    style={{ width: `${Math.min((value / MAX_BASE_STAT) * 100, 100)}%` }}
                                />
                            </div>
                        </li>
                    ))}
                    <li className="stat-row stat-total">
                        <span className="stat-name">Total</span>
                        <span className="stat-value">{totalStats}</span>
                    </li>
                </ul>
            </section>

            <div className="pokemon-details">
                <section>
                    <h3 className="section-title">Abilities</h3>
                    <ul className="ability-list">
                        {pokemon.abilities.map(({ name, isHidden }) => (
                            <li key={name}>
                                {name}
                                {isHidden && <span className="ability-hidden">Hidden</span>}
                            </li>
                        ))}
                    </ul>
                </section>

                {matchups && (
                    <section>
                        <h3 className="section-title">Type matchups</h3>
                        <MatchupRow label="Weak to" matchups={matchups.weaknesses} />
                        <MatchupRow label="Resists" matchups={matchups.resistances} />
                        <MatchupRow label="Immune to" matchups={matchups.immunities} />
                    </section>
                )}
            </div>

            {evolutionStages.length > 1 && (
                <section className="pokemon-evolution">
                    <h3 className="section-title">Evolution</h3>
                    <div className="evolution-chain">
                        {evolutionStages.map((stage, index) => (
                            <Fragment key={stage[0].id}>
                                {index > 0 && <span className="evolution-arrow" aria-hidden="true">→</span>}
                                <div className="evolution-stage">
                                    {stage.map(({ id, name }) => {
                                        const isCurrent = id === pokemon.speciesId;
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                className={`evolution-item ${isCurrent ? 'is-current' : ''}`}
                                                onClick={() => onSelectPokemon(id)}
                                                disabled={isCurrent}
                                                aria-current={isCurrent}
                                            >
                                                <img src={getArtworkUrl(id)} alt="" loading="lazy" />
                                                <span className="evolution-name">{name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default PokemonCard;
