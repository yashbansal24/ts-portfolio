import ReactDOM from 'react-dom/client';
import App from './src/App';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { BrowserRouter } from "react-router-dom";
import Default404 from './src/404'
import Backend from './src/backend'
import ChatGPT from './src/chatgpt'
import Diary from './src/diary'
import Contact from './src/components/stripe-pricing-table'
import ParallaxDemo from './src/components/Parallax'

// Define an array of components to test
const componentsToTest = [
  App,
  Default404,
  Backend,
  ChatGPT,
  Diary,
  Contact,
  ParallaxDemo
];

describe('Testing React Components', () => {
  test.each(componentsToTest)('%p component renders without crashing', (Component) => {
    const div = document.createElement('div');
    ReactDOM.render(
      <NextThemesProvider>
        <BrowserRouter>
          <Component />
        </BrowserRouter>
      </NextThemesProvider>,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
