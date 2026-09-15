// Alternate forms (Mega, regional...) use ids above this, which aren't Pokédex numbers
export const FIRST_ALTERNATE_FORM_ID = 10000;

// Format API names like "special-attack" or "thick-fat" as "Special Attack" / "Thick Fat"
export function formatName(val) {
    return String(val)
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Official artwork URL for a Pokémon id, used for evolution thumbnails without extra requests
export function getArtworkUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Latest cry URL for a Pokémon id, same file the API returns in cries.latest
export function getCryUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
}

// Small sprite URL for a Pokémon id, used in the search suggestions
export function getSpriteUrl(id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

// Pokédex number like "#025"
export function formatPokedexNumber(id) {
    return `#${String(id).padStart(3, '0')}`;
}

// Extract the numeric id from an API resource URL, e.g. ".../pokemon-species/143/" -> 143
export function getIdFromUrl(url) {
    return Number(url.split('/').filter(Boolean).pop());
}

// Turn what the user typed into an API name or number: " Mr Mime " -> "mr-mime", "#025" -> "25"
export function normalizeSearchQuery(query) {
    const value = String(query).trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-');
    return /^\d+$/.test(value) ? String(Number(value)) : value;
}

// Suggestions for the search box: exact matches first, then names starting with the query, then containing it
export function filterPokemonList(pokemonList, query, limit = 8) {
    const search = normalizeSearchQuery(query);
    if (!search) return [];

    if (/^\d+$/.test(search)) {
        return pokemonList.filter(({ id }) => id === Number(search));
    }

    const exact = [];
    const startsWith = [];
    const includes = [];
    pokemonList.forEach((pokemon) => {
        if (pokemon.name === search) exact.push(pokemon);
        else if (pokemon.name.startsWith(search)) startsWith.push(pokemon);
        else if (pokemon.name.includes(search)) includes.push(pokemon);
    });

    return [...exact, ...startsWith, ...includes].slice(0, limit);
}

// Pokédex text comes with game line breaks and form feeds, so collapse them into single spaces
function cleanFlavorText(text) {
    return text
        .replace(/­\n/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Combine the damage relations of every type the Pokémon has into weaknesses, resistances and immunities
function getTypeMatchups(typeDetails) {
    const multipliers = {};
    const applyMultiplier = (types, factor) => {
        types.forEach(({ name }) => {
            multipliers[name] = (multipliers[name] ?? 1) * factor;
        });
    };

    typeDetails.forEach(({ damage_relations: relations }) => {
        applyMultiplier(relations.double_damage_from, 2);
        applyMultiplier(relations.half_damage_from, 0.5);
        applyMultiplier(relations.no_damage_from, 0);
    });

    const matchups = Object.entries(multipliers).map(([type, multiplier]) => ({ type, multiplier }));

    return {
        weaknesses: matchups.filter(({ multiplier }) => multiplier > 1).sort((a, b) => b.multiplier - a.multiplier),
        resistances: matchups
            .filter(({ multiplier }) => multiplier > 0 && multiplier < 1)
            .sort((a, b) => a.multiplier - b.multiplier),
        immunities: matchups.filter(({ multiplier }) => multiplier === 0),
    };
}

// Flatten the evolution tree into stages, so branches (e.g. Eevee) share a stage
function getEvolutionStages(chain) {
    const stages = [];
    let currentLinks = [chain];

    while (currentLinks.length > 0) {
        stages.push(currentLinks.map(({ species }) => ({ id: getIdFromUrl(species.url), name: formatName(species.name) })));
        currentLinks = currentLinks.flatMap((link) => link.evolves_to);
    }

    return stages;
}

// Build the data shown on the card. Species, type and evolution data are optional (null if their request failed)
export function buildPokemon(data, species, typeDetails, evolutionChain) {
    const artwork = data.sprites.other['official-artwork'];
    // Animated GIFs: Pokémon Showdown covers almost every Pokémon, Black/White only up to #649
    const showdown = data.sprites.other.showdown;
    const blackWhite = data.sprites.versions?.['generation-v']?.['black-white']?.animated;
    const flavorText = species?.flavor_text_entries.findLast(({ language }) => language.name === 'en')?.flavor_text;

    return {
        id: data.id,
        speciesId: getIdFromUrl(data.species.url),
        name: formatName(data.name),
        // Not every Pokémon (e.g. Mega forms) has a Dream World sprite, so fall back to other artwork
        sprite: data.sprites.other.dream_world.front_default ?? artwork.front_default ?? data.sprites.front_default,
        shinySprite: artwork.front_shiny ?? data.sprites.front_shiny,
        animatedSprite: showdown?.front_default ?? blackWhite?.front_default ?? null,
        animatedShinySprite: showdown?.front_shiny ?? blackWhite?.front_shiny ?? null,
        cry: data.cries?.latest,
        types: data.types.map(({ type }) => type.name),
        stats: data.stats.map(({ stat, base_stat }) => ({ name: stat.name, value: base_stat })),
        // The API returns height in decimetres and weight in hectograms
        height: data.height / 10,
        weight: data.weight / 10,
        abilities: data.abilities.map(({ ability, is_hidden }) => ({ name: formatName(ability.name), isHidden: is_hidden })),
        genus: species?.genera.find(({ language }) => language.name === 'en')?.genus,
        description: flavorText ? cleanFlavorText(flavorText) : null,
        generation: species ? `Gen ${species.generation.name.split('-')[1].toUpperCase()}` : null,
        isLegendary: species?.is_legendary ?? false,
        isMythical: species?.is_mythical ?? false,
        matchups: typeDetails ? getTypeMatchups(typeDetails) : null,
        evolutionStages: evolutionChain ? getEvolutionStages(evolutionChain.chain) : [],
    };
}
