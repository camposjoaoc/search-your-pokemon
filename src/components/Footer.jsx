import { Link } from 'react-router-dom';
import '../sass/Footer.scss'; 

// Footer component for website footer
function Footer() {
    return (
        <div className="footer-content">
            {/* Footer text with copyright */}
            <p>&copy; 2024 PixelPlay Store</p>
            <p>All rights reserved.</p>

            {/* Social media icons with links */}
            <div className="social-icons">
                {/* Facebook icon with accessible label */}
                <a href="https://facebook.com" target="_blank" aria-label="Facebook">
                    <i className="fa-brands fa-facebook"></i>
                </a>

                {/* Twitter icon with accessible label */}
                <a href="https://twitter.com" target="_blank" aria-label="Twitter">
                    <i className="fa-brands fa-twitter"></i>
                </a>

                {/* Instagram icon with accessible label */}
                <a href="https://instagram.com" target="_blank" aria-label="Instagram">
                    <i className="fa-brands fa-instagram"></i>
                </a>

                {/* LinkedIn icon with accessible label */}
                <a href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
                    <i className="fa-brands fa-linkedin"></i>
                </a>
            </div>
        </div>
    );
}

export default Footer;