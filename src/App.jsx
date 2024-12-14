import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'normalize.css';
import '../src/sass/App.scss';
import PokemonFetcher from "./components/PokemonFetcher";
import Footer from './components/Footer'; // Footer component

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<PokemonFetcher />} />
                </Routes>
                {/* Footer component displayed on all pages */}
                <Footer></Footer>
            </BrowserRouter>
        </>
    )
}
export default App
