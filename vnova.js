class Nova {
    constructor(element) {
        this.element = element;
    }

    static createElement(tagName, attributes = {}, ...children) {
        const element = document.createElement(tagName);
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
        children.forEach(child => {
            if (typeof child === 'string') {
                element.textContent = child;
            } else if (child instanceof Node) {
                element.appendChild(child);
            } else if (child instanceof Nova) {
                element.appendChild(child.element);
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
            if (this.element === document.documentElement || this.element === document.body) {
                throw new Error('Only one element on document allowed.');
            }
            this.element.appendChild(child.element);
        } else if (child instanceof Node) {
            if (this.element === document.documentElement || this.element === document.body) {
                throw new Error('Only one element on document allowed.');
            }
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

    static async request(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const contentType = response.headers.get("content-type");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = contentType && contentType.includes("application/json") ? await response.json() : await response.text();
            Nova.emitAwaitEvent(false);
            return data;
        } catch (error) {
            Nova.emitAwaitEvent(false);
            throw error;
        }
    }

    static get(url, options = {}) {
        Nova.emitAwaitEvent(true);
        return Nova.request(url, { method: 'GET', ...options });
    }

    static emitAwaitEvent(isAwaiting) {
        const event = new CustomEvent('awaitEvent', { detail: isAwaiting });
        document.dispatchEvent(event);
    }
}

export default Nova;
