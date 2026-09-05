import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import ScrollToTop from './components/ScrollToTop';

import Header from './components/public/Header';
import Footer from './components/public/Footer';
import Home from './pages/public/Home';
import Shop from './pages/public/Shop';
import ProductPage from './pages/public/ProductPage';
import CartPage from './pages/public/CartPage';
import Checkout from './pages/public/Checkout';
import OrderConfirmed from './pages/public/OrderConfirmed';
import ServiceRequest from './pages/public/ServiceRequest';
import TrackOrder from './pages/public/TrackOrder';
import TrackService from './pages/public/TrackService';
import Categories from './pages/public/Categories';
import Contact from './pages/public/Contact';
import PageView from './pages/public/PageView';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Account from './pages/customer/Account';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPOS from './pages/admin/AdminPOS';
import AdminService from './pages/admin/AdminService';
import AdminFinancial from './pages/admin/AdminFinancial';
import AdminStock from './pages/admin/AdminStock';
import AdminClients from './pages/admin/AdminClients';
import AdminSite from './pages/admin/AdminSite';
import AdminSettings from './pages/admin/AdminSettings';

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 400px)' }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="categorias" element={<AdminCategories />} />
                <Route path="pedidos" element={<AdminOrders />} />
                <Route path="pos" element={<AdminPOS />} />
                <Route path="assistencia" element={<AdminService />} />
                <Route path="financeiro" element={<AdminFinancial />} />
                <Route path="estoque" element={<AdminStock />} />
                <Route path="clientes" element={<AdminClients />} />
                <Route path="site" element={<AdminSite />} />
                <Route path="configuracoes" element={<AdminSettings />} />
              </Route>

              {/* PUBLIC ROUTES */}
              <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/loja" element={<PublicLayout><Shop /></PublicLayout>} />
              <Route path="/produto/:id" element={<PublicLayout><ProductPage /></PublicLayout>} />
              <Route path="/categorias" element={<PublicLayout><Categories /></PublicLayout>} />
              <Route path="/carrinho" element={<PublicLayout><CartPage /></PublicLayout>} />
              <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
              <Route path="/pedido-confirmado/:id" element={<PublicLayout><OrderConfirmed /></PublicLayout>} />
              <Route path="/assistencia" element={<PublicLayout><ServiceRequest /></PublicLayout>} />
              <Route path="/acompanhar-pedido" element={<PublicLayout><TrackOrder /></PublicLayout>} />
              <Route path="/acompanhar-servico" element={<PublicLayout><TrackService /></PublicLayout>} />
              <Route path="/contato" element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/pagina/:slug" element={<PublicLayout><PageView /></PublicLayout>} />
              <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
              <Route path="/registro" element={<PublicLayout><Register /></PublicLayout>} />
              <Route path="/conta" element={<PublicLayout><Account /></PublicLayout>} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
