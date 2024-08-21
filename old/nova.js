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

    onDelegated(event, selector, callback) {
        this.element.addEventListener(event, function (e) {
            const targetElement = e.target.closest(selector);
            if (targetElement && this.element.contains(targetElement)) {
                callback.call(targetElement, e);
            }
        });
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

    scrollTo(duration = 400) {
        const start = window.pageYOffset;
        const end = this.element.getBoundingClientRect().top + start;
        const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

        const scroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            window.scrollTo(0, start + (end - start) * progress);
            if (progress < 1) {
                requestAnimationFrame(scroll);
            }
        };
        requestAnimationFrame(scroll);
        return this;
    }

    insertBefore(newElement) {
        if (newElement instanceof Nova) {
            this.element.parentNode.insertBefore(newElement.element, this.element);
        } else if (newElement instanceof Node) {
            this.element.parentNode.insertBefore(newElement, this.element);
        }
        return this;
    }

    insertAfter(newElement) {
        if (newElement instanceof Nova) {
            this.element.parentNode.insertBefore(newElement.element, this.element.nextSibling);
        } else if (newElement instanceof Node) {
            this.element.parentNode.insertBefore(newElement, this.element.nextSibling);
        }
        return this;
    }

    getAttribute(name) {
        return this.element.getAttribute(name);
    }

    setAttribute(name, value) {
        this.element.setAttribute(name, value);
        return this;
    }

    removeAttribute(name) {
        this.element.removeAttribute(name);
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

    static post(url, data, options = {}) {
        Nova.emitAwaitEvent(true);
        return Nova.request(url, {
            method: 'POST',
            body: data,
            ...options
        });
    }

    static emitAwaitEvent(isAwaiting) {
        const event = new CustomEvent('awaitEvent', { detail: isAwaiting });
        document.dispatchEvent(event);
    }
}

// デフォルトで documentElement を使用可能にする
Nova.documentElement = new Nova(document);

export default Nova;
