import Router from './Router.js';
import { Nova } from './Nova.js';

const router = new Router();

// Define routes and their handlers
router.addRoute('/', () => {
    const vnode = Nova.createElement('h1', {}, 'Home Page');
    Nova.render(vnode, '#root');
});

router.addRoute('/contacts', () => {
    const vnode = Nova.createElement('h1', {}, 'Contacts Page');
    Nova.render(vnode, '#root');
});

router.addRoute('/user/:id', (params) => {
    const vnode = Nova.createElement('h1', {}, `User Page with params: ${JSON.stringify(params)}`);
    Nova.render(vnode, '#root');
});

// Initialize router
document.addEventListener('DOMContentLoaded', () => {
    router.handleRouteChange(); // Initial route handling on page load
});
