import foundSound from '../assets/audio/pokemon-found.mp3';

// Play the Pokémon's own cry, falling back to the default sound (e.g. Safari can't play the .ogg cries)
export function playFoundAudio(cryUrl) {
    const playDefault = () => {
        new Audio(foundSound).play().catch((error) => {
            console.error('Error playing audio:', error);
        });
    };

    if (!cryUrl) {
        playDefault();
        return;
    }

    const cry = new Audio(cryUrl);
    cry.volume = 0.5; // Cries are much louder than the default sound
    cry.play().catch(playDefault);
}
