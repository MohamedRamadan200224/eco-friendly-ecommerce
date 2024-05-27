import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Product from "./components/Product";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <Router>
      <main>
        {/* NAVBAR */}
        <Navbar />
        {/* ROUTES */}
        <ToastContainer position="top-center" />
        <Toaster />
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<Product />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </div>
        {/* FOOTER */}
        <Footer />
      </main>
    </Router>
  );
}

export default App;
