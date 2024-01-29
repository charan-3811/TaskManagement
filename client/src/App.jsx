
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Tasks from "./components/Tasks.jsx";


function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route default path="/" element={<Tasks/>} />

            </Routes>
        </BrowserRouter>
    );
}

export default App
