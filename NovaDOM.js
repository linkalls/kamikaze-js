class Nova {
    constructor(element) {
        this.element = element;
        this.data = {};
    }

    static select(selector) {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Element not found for selector: ${selector}`);
        return new Nova(element);
    }

    static selectAll(selector) {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(element => new Nova(element));
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

    bindData(data) {
        this.data = data;
        this.updateInterpolation();
        this.autoWatch();
        return this;
    }

    updateInterpolation() {
        const elements = this.element.querySelectorAll('*');
        elements.forEach(element => {
            let html = element.innerHTML;
            Object.keys(this.data).forEach(key => {
                const regExp = new RegExp(`{{${key}}}`, 'g');
                html = html.replace(regExp, this.data[key]);
            });
            element.innerHTML = html;
        });
        this.updateAllBindings();
    }

    autoWatch() {
        Object.keys(this.data).forEach(key => {
            let value = this.data[key];
            Object.defineProperty(this.data, key, {
                get: () => value,
                set: newValue => {
                    if (value !== newValue) {
                        value = newValue;
                        this.updateInterpolation();
                    }
                }
            });
        });
    }

    updateAllBindings() {
        const bindings = this.element.querySelectorAll('[data-bind]');
        bindings.forEach(binding => {
            const key = binding.getAttribute('data-bind');
            if (key in this.data) {
                if (binding.tagName === 'INPUT' || binding.tagName === 'TEXTAREA') {
                    binding.value = this.data[key];
                } else {
                    binding.textContent = this.data[key];
                }
            }
        });
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
        }.bind(this));
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
        this.updateInterpolation();
        return this;
    }

    innerText(text) {
        this.element.innerText = text;
        this.updateInterpolation();
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
}

export default Nova;
