class VirtualDOM {
    constructor() {
        this.root = null;
    }

    render(vnode, container) {
        const newRoot = this.createElement(vnode);
        if (this.root) {
            this.update(this.root, newRoot, container);
        } else {
            container.appendChild(newRoot);
        }
        this.root = newRoot;
    }

    createElement(vnode) {
        if (typeof vnode === 'string') {
            return document.createTextNode(vnode);
        }

        const element = document.createElement(vnode.tagName);
        Object.entries(vnode.attributes || {}).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        (vnode.children || []).forEach(child => {
            element.appendChild(this.createElement(child));
        });

        return element;
    }

    update(oldVNode, newVNode, container) {
        if (!this.isSameVNode(oldVNode, newVNode)) {
            container.replaceChild(this.createElement(newVNode), oldVNode.element);
            return;
        }

        const element = newVNode.element = oldVNode.element;
        this.updateAttributes(element, oldVNode.attributes, newVNode.attributes);
        this.updateChildren(element, oldVNode.children, newVNode.children);
    }

    isSameVNode(oldVNode, newVNode) {
        return oldVNode && newVNode && oldVNode.tagName === newVNode.tagName;
    }

    updateAttributes(element, oldAttributes, newAttributes) {
        Object.keys(oldAttributes || {}).forEach(key => {
            if (!(key in newAttributes)) {
                element.removeAttribute(key);
            }
        });

        Object.entries(newAttributes || {}).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }

    updateChildren(element, oldChildren = [], newChildren = []) {
        const maxLength = Math.max(oldChildren.length, newChildren.length);
        for (let i = 0; i < maxLength; i++) {
            this.update(
                oldChildren[i] || { element: null },
                newChildren[i] || { element: null },
                element
            );
        }
    }
}

const vdom = new VirtualDOM();

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
        vdom.render(vnode, container);
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
        document.addEventListener(event, e => {
            const targetElement = e.target.closest(selector);
            if (targetElement && this.element.contains(targetElement)) {
                callback.call(targetElement, e);
            }
        });
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

export { Nova, vdom };
