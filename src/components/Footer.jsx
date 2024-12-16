import { Link } from 'react-router-dom';
import '../sass/Footer.scss';

// Footer component for website footer
function Footer() {
    return (
        <div className="footer-content">
            {/* Footer text with copyright */}
            <p>&copy;2024 Pokémon.</p>
            <p>&copy;1995 - 2024 Nintendo/Creatures Inc./GAME FREAK inc. TM, &copy;Nintendo.</p>
            <p>All rights reserved.</p>
        </div>
    );
}
export default Footer;