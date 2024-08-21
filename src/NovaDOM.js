class Nova {
    constructor(element) {
        this.element = element instanceof Element ? element : document.createElement(element);
        this.data = {};
        this.proxyData = null;
        this.templateNodes = new Map();
    }

    static select(selector) {
        const element = document.querySelector(selector);
        return element ? new Nova(element) : null;
    }

    static selectAll(selector) {
        return Array.from(document.querySelectorAll(selector)).map(el => new Nova(el));
    }

    bindData(data) {
        this.data = data;
        this.proxyData = new Proxy(this.data, {
            set: (target, key, value) => {
                target[key] = value;
                this.updateInterpolation();
                return true;
            }
        });
        this.saveTemplates(this.element);
        this.updateInterpolation();
        return this;
    }

    saveTemplates(element) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.includes('{{')) {
                this.templateNodes.set(node, node.textContent);
            }
        }
    }

    updateInterpolation() {
        this.templateNodes.forEach((template, node) => {
            if (node.parentNode) {  // Check if the node is still in the document
                let newContent = template;
                Object.keys(this.data).forEach(key => {
                    const regExp = new RegExp(`{{${key}}}`, 'g');
                    newContent = newContent.replace(regExp, this.data[key]);
                });
                if (node.textContent !== newContent) {
                    node.textContent = newContent;
                }
            } else {
                this.templateNodes.delete(node);  // Remove reference to nodes that are no longer in the document
            }
        });
        this.updateAllBindings();
    }

    updateAllBindings() {
        const bindings = this.element.querySelectorAll('[data-bind]');
        bindings.forEach(binding => {
            const bindingDefinitions = binding.getAttribute('data-bind').split(',');
            bindingDefinitions.forEach(definition => {
                const [key, property] = definition.split(':').map(item => item.trim());

                if (key in this.proxyData) {
                    const bindProperty = property || 'value'; // プロパティが指定されていない場合は 'value' をデフォルトに

                    if (binding.tagName === 'INPUT' || binding.tagName === 'TEXTAREA') {
                        if (bindProperty === 'value') {
                            if (document.activeElement !== binding) {
                                binding.value = this.proxyData[key];
                            }
                            if (!binding._novaListenerAdded) {
                                binding.addEventListener('input', (e) => {
                                    this.proxyData[key] = e.target.value;
                                });
                                binding._novaListenerAdded = true;
                            }
                        }
                    } else {
                        const firstChild = binding.firstChild;
                        if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
                            if (!this.templateNodes.has(firstChild)) {
                                this.templateNodes.set(firstChild, firstChild.textContent);
                            }
                            const template = this.templateNodes.get(firstChild);
                            const newContent = template.replace(`{{${key}}}`, this.proxyData[key]);
                            if (firstChild.textContent !== newContent) {
                                firstChild.textContent = newContent;
                            }
                        }
                    }
                }
            });
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
        this.element.addEventListener(event, function(e) {
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
        } else if (typeof child === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = child;
            while (tempDiv.firstChild) {
                this.element.appendChild(tempDiv.firstChild);
            }
        }
        this.saveTemplates(this.element);
        this.updateInterpolation();
        return this;
    }

    innerHTML(html) {
        this.element.innerHTML = html;
        this.saveTemplates(this.element);
        this.updateInterpolation();
        return this;
    }

    innerText(text) {
        this.element.innerText = text;
        this.saveTemplates(this.element);
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