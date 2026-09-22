import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ChatProvider } from './context/ChatContext'
import Layout from './components/layout/Layout/Layout'
import AmbientPlayer from './components/ui/AmbientPlayer/AmbientPlayer'
import Home from './pages/Home/Home'
import Chat from './pages/Chat/Chat'
import About from './pages/About/About'
import Evaluation from './pages/Evaluation/Evaluation'
import Ethics from './pages/Ethics/Ethics'
import Roadmap from './pages/Roadmap/Roadmap'
import References from './pages/References/References'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import NotFound from './pages/NotFound/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        {/* Global ambient music controller on every page (muted by default on /chat and /login) */}
        <AmbientPlayer />
        <Routes>
          {/* ── Standalone full-screen routes (no Nav/Footer) ── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat"     element={<Chat />} />

          {/* ── Marketing / info pages — with Layout (Nav + Footer) ── */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about"      element={<About />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="ethics"     element={<Ethics />} />
            <Route path="roadmap"    element={<Roadmap />} />
            <Route path="references" element={<References />} />
            <Route path="*"          element={<NotFound />} />
          </Route>
        </Routes>
      </ChatProvider>
    </BrowserRouter>
  )
}
