// カスタムエラークラス
class HTTPError extends Error {
    constructor(message, url, method, status, body) {
        super(message);
        this.name = 'HTTPError';
        this.url = url;
        this.method = method;
        this.status = status;
        this.body = body;
    }
}

class NovaHTTP {
    static awaitEventStatus = false; // awaitEventの状態を管理する

    static getAwaitEventStatus() {
        return NovaHTTP.awaitEventStatus;
    }

    static setAwaitEventStatus(status) {
        NovaHTTP.awaitEventStatus = status;
        const event = new CustomEvent('awaitEvent', { detail: status });
        document.dispatchEvent(event);
    }

    static async request(url, method, data = null, headers = {}) {
        NovaHTTP.setAwaitEventStatus(true); // リクエスト開始時にtrueにする

        // データがオブジェクト型の場合のみContent-Typeを設定
        const isJson = data && typeof data === 'object';
        const contentType = isJson ? 'application/json' : '';

        const options = {
            method,
            headers: {
                ...headers,
                ...(contentType ? { 'Content-Type': contentType } : {})
            },
            body: isJson ? JSON.stringify(data) : data
        };

        try {
            const response = await fetch(url, options);
            const responseBody = await response.text(); // レスポンスボディを一度テキストとして取得

            if (!response.ok) {
                // エラー詳細を含めたカスタムエラーを作成してthrow
                throw new HTTPError(
                    `HTTP error! Status: ${response.status}`,
                    url,
                    method,
                    response.status,
                    responseBody
                );
            }

            try {
                return JSON.parse(responseBody); // JSONレスポンスをパース
            } catch (jsonError) {
                // JSONパースエラーの詳細を含めたカスタムエラーを作成してthrow
                throw new HTTPError(
                    `JSON parse error!`,
                    url,
                    method,
                    response.status,
                    responseBody
                );
            }
        } catch (error) {
            // 詳細なエラーメッセージをログに出力
            console.error(`Error during HTTP request: ${error.message}`);
            console.error(`URL: ${error.url}`);
            console.error(`Method: ${error.method}`);
            console.error(`Status: ${error.status}`);
            console.error(`Response Body: ${error.body}`);

            throw error; // エラーを再スロー
        } finally {
            NovaHTTP.setAwaitEventStatus(false); // リクエスト完了時にfalseにする
        }
    }

    static get(url, headers = {}) {
        return NovaHTTP.request(url, 'GET', null, headers);
    }

    static post(url, data, headers = {}) {
        return NovaHTTP.request(url, 'POST', data, headers);
    }

    static put(url, data, headers = {}) {
        return NovaHTTP.request(url, 'PUT', data, headers);
    }

    static delete(url, headers = {}) {
        return NovaHTTP.request(url, 'DELETE', null, headers);
    }

    static patch(url, data, headers = {}) {
        return NovaHTTP.request(url, 'PATCH', data, headers);
    }
}

export { NovaHTTP };
