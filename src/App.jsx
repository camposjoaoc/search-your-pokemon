import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'normalize.css';
import '../src/styles/App.scss';
import PokemonFetcher from "./components/PokemonFetcher";

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<PokemonFetcher />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}
export default App
