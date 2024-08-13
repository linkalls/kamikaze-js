class Kamikaze {
    constructor(element) {
        this.element = element;
    }

    static createElement(tagName, attributes = {}, ...children) {
        const element = document.createElement(tagName);

        // 属性の設定
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }

        // 子要素の追加
        children.forEach(child => {
            if (typeof child === 'string') {
                element.textContent = child;
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return new Kamikaze(element);
    }

    static select(selector) {
        const element = document.querySelector(selector);
        return new Kamikaze(element);
    }

    static selectAll(selector) {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(element => new Kamikaze(element));
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
        if (child instanceof Kamikaze) {
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
    
    remove(){
        this.element.remove()
    }

    static async request(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const contentType = response.headers.get("content-type");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // レスポンスが JSON の場合はオブジェクトに変換
            const data = contentType && contentType.includes("application/json") ? await response.json() : await response.text();
            
    
            Kamikaze.emitAwaitEvent(false)
            return data;
        } catch (error) {
            
            Kamikaze.emitAwaitEvent(false);
            throw error;
        }
    }

    static get(url, options = {}) {
        Kamikaze.emitAwaitEvent(true);
        return Kamikaze.request(url, { method: 'GET', ...options });
    }

    static post(url, data, options = {}) {
        Kamikaze.emitAwaitEvent(true)
        return Kamikaze.request(url, {
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
Kamikaze.documentElement = new Kamikaze(document);

export default Kamikaze;
