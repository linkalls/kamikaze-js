import { Nova } from './Nova.js';

class Router {
    constructor() {
        this.routes = [];
        this.currentPath = '';
        this.currentParams = {};
        this.init();
    }

    init() {
        window.addEventListener('popstate', () => this.handleRouteChange());
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-link]')) {
                event.preventDefault();
                this.navigate(event.target.getAttribute('href'));
            }
        });
        this.handleRouteChange(); // Initialize route handling on page load
    }

    addRoute(pattern, handler) {
        this.routes.push({ pattern, handler });
    }

    matchRoute(path) {
        return this.routes.find(route => {
            const regex = new RegExp('^' + route.pattern.replace(/:\w+/g, '([^/]+)') + '$');
            return regex.test(path);
        });
    }

    extractParams(pattern, path) {
        const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$');
        const match = path.match(regex);
        if (match) {
            const paramNames = (pattern.match(/:\w+/g) || []).map(param => param.substring(1));
            const params = paramNames.reduce((params, param, index) => {
                params[param] = match[index + 1];
                return params;
            }, {});
            return params;
        }
        return {};
    }

    handleRouteChange() {
        this.currentPath = location.pathname;
        console.log(`Handling route change for ${this.currentPath}`);
        const matchedRoute = this.matchRoute(this.currentPath);
        if (matchedRoute) {
            this.currentParams = this.extractParams(matchedRoute.pattern, this.currentPath);
            console.log(`Matched route: ${matchedRoute.pattern}, Params:`, this.currentParams);
            if (typeof matchedRoute.handler === 'function') {
                matchedRoute.handler(this.currentParams);
            } else {
                console.error('Handler for route is not a function');
            }
        } else {
            console.error('No handler for route:', this.currentPath);
            Nova.render({ tagName: 'h1', children: ['404 Not Found'] }, 'root');
        }
    }

    navigate(path) {
        console.log(`Navigating to ${path}`);
        history.pushState({}, '', path);
        this.handleRouteChange();
    }
}

export default Router;
