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
import ResetPassword from "./pages/ResetPassword";
import DiscountProduct from "./pages/DiscountProduct";
import UpdateProduct from "./pages/UpdateProduct";
import UpdateUser from "./pages/UpdateUser";
import CreateUser from "./pages/CreateUser";
import Admin from "./middleware/Admin";
import Guest from "./middleware/Guest";
import NotFound from "./pages/NotFound";
import Client from "./middleware/Client";

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

            {/* Admin Routes */}
            <Route element={<Admin />}>
              <Route path="/users" element={<Users />} />

              <Route path="/updateuser/:id" element={<UpdateUser />} />
              <Route path="/createuser" element={<CreateUser />} />
            </Route>

            <Route element={<Client />}>
              <Route
                path="/discountproduct/:id"
                element={<DiscountProduct />}
              />
              <Route path="/updateproduct/:id" element={<UpdateProduct />} />
            </Route>

            {/* Guest Routes */}
            <Route element={<Guest />}>
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/resetpassword/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        {/* FOOTER */}
        <Footer />
      </main>
    </Router>
  );
}

export default App;
