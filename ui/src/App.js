import React from "react";
import { createBrowserRouter, RouterProvider, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "../src/layouts/Component/layout";
import Home from "../src/pages/Home";
import Login from '../src/pages/login';
import About from '../src/pages/About';
import ScrollToTopButton from '../src/layouts/Component/scrollButton';
import HairCutServices from "./layouts/Component/haircombo";
import ServiceDetail from "./layouts/Component/servicedetail";


// ... phần còn lại của code ...
// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Wrapper component to include ScrollToTop
function LayoutWithScrollToTop() {
  return (
    <>
      <ScrollToTop />
      <Layout />
      <ScrollToTopButton />
    </>
  );
}

function App() {
  const router = createBrowserRouter([
    {
      path: "",
      element: <LayoutWithScrollToTop />,
      children: [
        { path: "", element: <Home /> },
        { path: "/login", element: <Login /> },
        { path: "/home", element: <Home /> },
        { path: "/about", element: <About /> },
        { path: "/dich-vu-cat-toc", element: <HairCutServices /> },
        { path: "/dich-vu/:serviceId", element: <ServiceDetail /> },
      ],
    },
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
    
  );
}

export default App;