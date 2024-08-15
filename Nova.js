class Nova {
    constructor(element) {
        this.element = element;
    }

    static createElement(tagName, attributes = {}, ...children) {
        const element = document.createElement(tagName);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Nova) {
                element.appendChild(child.element);
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return new Nova(element);
    }

    static select(selector) {
        const element = document.querySelector(selector);
        return new Nova(element);
    }

    static selectAll(selector) {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(element => new Nova(element));
    }

    static render(vnode, containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`Container not found: ${containerSelector}`);
            return;
        }
        container.innerHTML = ''; // Clear existing content
        if (vnode && vnode.element) {
            container.appendChild(vnode.element);
        } else {
            console.error('Invalid vnode or vnode.element');
        }
    }

    setStyle(property, value) {
        this.element.style[property] = value;
        return this;
    }

    addClass(className) {
        this.element.classList.add(className);
        return this;
    }

    removeClass(className) {
        this.element.classList.remove(className);
        return this;
    }

    toggleClass(className) {
        this.element.classList.toggle(className);
        return this;
    }

    on(event, callback) {
        this.element.addEventListener(event, callback);
        return this;
    }

    in(child) {
        if (child instanceof Nova) {
            this.element.appendChild(child.element);
        } else if (child instanceof Node) {
            this.element.appendChild(child);
        }
        return this;
    }

    innerHTML(html) {
        this.element.innerHTML = html;
        return this;
    }

    innerText(text) {
        this.element.innerText = text;
        return this;
    }

    remove() {
        this.element.remove();
        return this;
    }
}

export { Nova };
