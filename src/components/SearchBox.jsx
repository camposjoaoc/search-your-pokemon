import { useMemo, useState } from 'react';
import { useCombobox } from 'downshift';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '../sass/searchBox.scss';
import {
    FIRST_ALTERNATE_FORM_ID,
    filterPokemonList,
    formatName,
    formatPokedexNumber,
    getSpriteUrl,
} from '../utils/pokemon';

// Search input with autocomplete suggestions, plus the random and search buttons.
// onSearch and onRandom resolve to true when a Pokémon was found, so the input can be cleared
function SearchBox({ pokemonList, onSearch, onRandom, isLoading }) {
    // Copy of the typed text used only to filter suggestions; Downshift owns the input value,
    // because controlling it from React state drops characters when typing fast
    const [query, setQuery] = useState('');
    const suggestions = useMemo(() => filterPokemonList(pokemonList, query), [pokemonList, query]);

    const {
        isOpen,
        highlightedIndex,
        inputValue,
        setInputValue,
        closeMenu,
        getLabelProps,
        getInputProps,
        getMenuProps,
        getItemProps,
    } = useCombobox({
        items: suggestions,
        // Always null so picking the same Pokémon again still triggers a search
        selectedItem: null,
        itemToString: (item) => (item ? item.name : ''),
        onInputValueChange: ({ inputValue: value }) => setQuery(value),
        onSelectedItemChange: ({ selectedItem }) => {
            if (selectedItem) search(onSearch(selectedItem.name));
        },
    });

    // Clear the input once the search finds a Pokémon
    const search = async (searchPromise) => {
        if (await searchPromise) {
            setInputValue('');
        }
    };

    // Search for exactly what was typed when no suggestion is highlighted
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload on form submission
        closeMenu();
        search(onSearch(inputValue));
    };

    const handleKeyDown = (e) => {
        // Downshift blocks Enter while the menu is open; let the form submit if no suggestion is highlighted
        if (e.key === 'Enter' && highlightedIndex < 0) {
            e.nativeEvent.preventDownshiftDefault = true;
        }
    };

    const showSuggestions = isOpen && suggestions.length > 0;

    return (
        <div className="search-box">
            <label {...getLabelProps()} className="visually-hidden">
                Search a Pokémon by name or number
            </label>

            <form className="search-form" onSubmit={handleSubmit}>
                <div className="search-input-wrapper">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="search-input-icon" aria-hidden="true" />
                    <input
                        {...getInputProps({ onKeyDown: handleKeyDown })}
                        className="input-style"
                        type="text"
                        placeholder="Name or number: Pikachu, 25, Snorlax..."
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
                <button
                    type="button"
                    className="btn-random"
                    onClick={() => search(onRandom())}
                    disabled={isLoading}
                    aria-label="Random Pokémon"
                    title="Random Pokémon"
                >
                    <FontAwesomeIcon icon={faDice} />
                </button>
                <button type="submit" className="btn-search" disabled={isLoading} aria-label="Find Pokémon">
                    <span className="btn-search-label">FIND POKÉMON</span> <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
            </form>

            <ul {...getMenuProps()} className={`suggestion-list ${showSuggestions ? 'is-open' : ''}`}>
                {showSuggestions &&
                    suggestions.map((item, index) => (
                        <li
                            key={item.name}
                            {...getItemProps({ item, index })}
                            className={`suggestion-item ${highlightedIndex === index ? 'is-highlighted' : ''}`}
                        >
                            <img
                                src={getSpriteUrl(item.id)}
                                alt=""
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.style.visibility = 'hidden'; // Some forms have no small sprite
                                }}
                            />
                            <span className="suggestion-name">{formatName(item.name)}</span>
                            {item.id < FIRST_ALTERNATE_FORM_ID && (
                                <span className="suggestion-number">{formatPokedexNumber(item.id)}</span>
                            )}
                        </li>
                    ))}
            </ul>
        </div>
    );
}

export default SearchBox;
