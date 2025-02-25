import React, { useState } from "react";
import "./App1.css";
import Home from "./components/home";


const App = () => {
    const [showHome, setShowHome] = useState(false);

    const handleClick = async () => {
        setShowHome(true); // Show Home component on button click
            
    };

    return (
        <div>
            <div className="header">
                <img src="/flogo.png" alt="Rotating Face Mask" className="mask-image" />
                <span className="logo-text">Face Mask Detector</span>
            </div>

            <div className="container">
                <button onClick={handleClick}>DETECT MASK</button>
            
            </div>
        
        {showHome && <Home />}  {/* Conditionally render Home */}
        </div>
            
    );
};
export default App;
