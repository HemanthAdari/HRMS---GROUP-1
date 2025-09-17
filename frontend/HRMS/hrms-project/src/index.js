import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css"
import EmailProvider from "./components/EmailContext";
import { DataProvider } from "./components/DataContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <DataProvider>
    <EmailProvider>
        <App />
    </EmailProvider>
    </DataProvider>);