export const mysqlConfig = {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "1",
    database: process.env.MYSQL_DB || "jobparser"
}

// Максимально ошибок перед отключением акка
// @ts-ignore
export const MAX_ERRORS_ACCOUNT = +process.env.MAX_ERRORS_ACCOUNT || 5;

// Сколько спарсить с 1 аккаунта, за 1 запуск
// @ts-ignore
export const DEFAULT_PARSE_LIMIT = +process.env.DEFAULT_PARSE_LIMIT || 30;

// Сколько задач запрашивать из БД за 1 запрос
// @ts-ignore
export const TASKS_LIMIT = +process.env.TASKS_LIMIT || 100;

// Свежесть резюме при поиске
// @ts-ignore
export const FRESHNESS = +process.env.FRESHNESS || 30;

// Сколько результатов на страницу (макс. - 500)
// @ts-ignore
export const ROWS_PER_PAGE = +process.env.ROWS_PER_PAGE || 400;

// Максимально параллельно потоков работы
// @ts-ignore
export const maxThreads = +process.env.MAX_THREADS || 10;

/* -- ProxyPoolFineproxy -- */
export const fineproxy = {
    login: process.env.FINEPROXY_LOGIN || '',
    pass: process.env.FINEPROXY_PASSWORD || '',
    updateTimer: 1000 * 60 * 60 * 6 // Через сколько обновлять прокси-лист
}
