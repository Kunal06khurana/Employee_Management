import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import Layout from "./Layout"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Employees from "./pages/Employees"
import Salary from "./pages/Salary"
import Reports from "./pages/Reports"

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/salary" element={<Salary />} />
      <Route path="/reports" element={<Reports />} />
    </Route>,
  ),
)

export default router

