import { useEffect, useMemo, useRef, useState } from 'react';
import '../sass/homeWidgets.scss';
import { readCache, writeCache } from '../utils/api';
import { playFoundAudio } from '../utils/audio';
import { FIRST_ALTERNATE_FORM_ID, formatName, getArtworkUrl, getCryUrl } from '../utils/pokemon';

const OPTION_COUNT = 4;
const BEST_STREAK_CACHE_KEY = 'whosThatPokemonBestStreak';

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

// A new round: distinct random options, one of them is the answer
function createRound(species) {
    const options = new Set();
    while (options.size < OPTION_COUNT) {
        options.add(pickRandom(species));
    }
    const optionList = [...options];
    return { answer: pickRandom(optionList), options: optionList };
}

// Home widget quiz: guess the Pokémon from its silhouette
function WhosThatPokemon({ pokemonList, onSelectPokemon }) {
    // Default forms only, so Mega and regional forms don't show up as options
    const species = useMemo(() => pokemonList.filter(({ id }) => id < FIRST_ALTERNATE_FORM_ID), [pokemonList]);

    const [round, setRound] = useState(null);
    // The option the user picked; null while the round is still open
    const [guess, setGuess] = useState(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(() => readCache(BEST_STREAK_CACHE_KEY) ?? 0);

    // Keyboard focus: move to "Next" after answering, and back to the options when the next round loads
    const nextButtonRef = useRef(null);
    const firstOptionRef = useRef(null);
    const focusOptionsOnLoad = useRef(false);

    const isRevealed = guess !== null;
    const isCorrect = isRevealed && guess.id === round.answer.id;
    const answerName = round ? formatName(round.answer.name) : '';

    // Start the first round once the Pokémon list is loaded
    useEffect(() => {
        if (species.length >= OPTION_COUNT) {
            setRound((currentRound) => currentRound ?? createRound(species));
        }
    }, [species]);

    useEffect(() => {
        if (isRevealed) nextButtonRef.current?.focus();
    }, [isRevealed]);

    useEffect(() => {
        if (isImageLoaded && focusOptionsOnLoad.current) {
            focusOptionsOnLoad.current = false;
            firstOptionRef.current?.focus();
        }
    }, [isImageLoaded]);

    const handleGuess = (option) => {
        setGuess(option);

        if (option.id === round.answer.id) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > bestStreak) {
                setBestStreak(newStreak);
                writeCache(BEST_STREAK_CACHE_KEY, newStreak);
            }
            playFoundAudio(getCryUrl(round.answer.id));
        } else {
            setStreak(0);
        }
    };

    const handleNextRound = () => {
        focusOptionsOnLoad.current = true;
        setRound(createRound(species));
        setGuess(null);
        setIsImageLoaded(false);
    };

    // Class showing whether an option was the answer or the wrong pick, once revealed
    const getOptionState = (option) => {
        if (!isRevealed) return '';
        if (option.id === round.answer.id) return 'is-correct';
        if (option.id === guess.id) return 'is-wrong';
        return '';
    };

    return (
        <section className="widget whos-that-pokemon" aria-labelledby="whos-that-pokemon-title">
            <h2 id="whos-that-pokemon-title" className="widget-title">
                <span aria-hidden="true">❓</span> Who&apos;s that Pokémon?
            </h2>
            <p className="quiz-streak">
                <span aria-hidden="true">🔥</span> Streak <strong>{streak}</strong> · Best <strong>{bestStreak}</strong>
            </p>

            {!round ? (
                <div className="widget-message">
                    <span className="pokeball-spinner" aria-hidden="true" />
                    Loading...
                </div>
            ) : (
                <>
                    <div className={`widget-image quiz-image ${isRevealed ? 'is-revealed' : ''}`}>
                        {!isImageLoaded && <span className="pokeball-spinner" aria-hidden="true" />}
                        <img
                            key={round.answer.id}
                            src={getArtworkUrl(round.answer.id)}
                            alt={isRevealed ? `Sprite of ${answerName}` : 'Silhouette of a mystery Pokémon'}
                            className={isImageLoaded ? '' : 'is-loading'}
                            onLoad={() => setIsImageLoaded(true)}
                            onError={() => setIsImageLoaded(true)} // Don't block the options if the image fails
                        />
                    </div>

                    <ul className="quiz-options">
                        {round.options.map((option, index) => (
                            <li key={option.id}>
                                <button
                                    ref={index === 0 ? firstOptionRef : null}
                                    type="button"
                                    className={`quiz-option ${getOptionState(option)}`}
                                    onClick={() => handleGuess(option)}
                                    disabled={isRevealed || !isImageLoaded}
                                >
                                    {formatName(option.name)}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <p className="quiz-result" role="status" aria-live="polite">
                        {isRevealed && (isCorrect ? `Correct! It's ${answerName}!` : `Oops! It's ${answerName}.`)}
                    </p>

                    <div className="quiz-actions">
                        {isRevealed && (
                            <>
                                <button ref={nextButtonRef} type="button" className="widget-button" onClick={handleNextRound}>
                                    Next Pokémon →
                                </button>
                                <button type="button" className="widget-link" onClick={() => onSelectPokemon(round.answer.id)}>
                                    See details
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}

export default WhosThatPokemon;
