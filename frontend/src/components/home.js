import { useState, useEffect } from "react";

export default function Home() {
    const [message, setMessage] = useState([]); // Store detection results
    const [maskPercentage, setMaskPercentage] = useState(0); // Store mask percentage for the last hour

    const fetchData = async () => {
        try {
            const response = await fetch("http://localhost:5000/image"); // Fetch data
            const result = await response.json();
            const data = Array.isArray(result) ? result : result.data ? Object.values(result.data) : [];

            console.log("Fetched Data:", data); // Debugging API response
            setMessage(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Fetch every 1 minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (message.length > 0) {
            calculateMaskPercentage(message);
        }
    }, [message]);

    const calculateMaskPercentage = (data) => {
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        let totalCount = 0, maskedCount = 0;

        data.forEach((item) => {
            if (!item.timestamp) return;
            const timestamp = new Date(item.timestamp).getTime();
            if (isNaN(timestamp)) return;

            if (timestamp >= oneHourAgo) {
                totalCount++;
                if (item.label === "Mask") maskedCount++;
            }
        });

        setMaskPercentage(totalCount > 0 ? ((maskedCount / totalCount) * 100).toFixed(2) : 0);
    };

    return (
        <div style={{ textAlign: "center", fontFamily: "Times New Roman" }}>
            <h3 style={{ color: "yellow", padding: "10px", fontSize: "35px" }}>
                Percentage of People Wearing Masks (Last 1 Hour)
            </h3>
            <p style={{
                backgroundColor: "white", padding: "10px",
                display: "inline-flex", justifyContent: "center",
                alignItems: "center", color: "black", borderRadius: "5px",
                height: "100px", width: "180px", fontSize: "50px"
            }}>
                {maskPercentage}%
            </p>
            <br />
            <button onClick={fetchData} style={{
                marginTop: "0px", padding: "10px 20px", fontSize: "24px",
                backgroundColor: "green", color: "white", border: "none",
                borderRadius: "5px", cursor: "pointer",height: "70px", width: "150px"
            }}>
                Refresh
            </button>
        </div>
    );
}
