import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { NextUIProvider } from '@nextui-org/react';
import GitHubCalendar from 'react-github-calendar';
import Streamgraph from './components/Streamgraph';
import { createTheme } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Routes, Route, Outlet, Link } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import Default404 from './404'
import Backend from './backend'
import Diary from './diary'

const lightTheme = createTheme({
  type: 'light',
  theme: {
  }
})

const darkTheme = createTheme({
  type: 'dark',
  theme: {
  }
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <div>
    <NextThemesProvider
      defaultTheme="dark"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className
      }}
    >
    <NextUIProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}></Route>
          <Route path="diary" element={<Diary />} ></Route>
          <Route path="systemdesign" element={<Backend />} ></Route>

          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          <Route path="*" element={<Default404 />}></Route>
      </Routes>
    </BrowserRouter>
      
      
    </NextUIProvider>
  </NextThemesProvider>
    <div style={{'margin': '0 auto'}}><Streamgraph width={window.outerWidth.toString()} height={'350'} animate/></div>
    <GitHubCalendar username="yashbansal24" color="red" style={{'margin': '0 auto'}}/>
  </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
