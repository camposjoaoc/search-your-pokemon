import '../sass/Footer.scss';

// Footer component for website footer
function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="footer-content">
            {/* Footer text with copyright */}
            <p>&copy;{currentYear} Pokémon.</p>
            <p>&copy;1995-{currentYear} Nintendo/Creatures Inc./GAME FREAK inc. TM</p>
            <p>&copy;Nintendo. All rights reserved.</p>
        </div>
    );
}
export default Footer;