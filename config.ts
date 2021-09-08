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

// Максимальное время, которое аккаунт находится в работе. Если что-то подвиснет
// и до этого времени аккаунт не сменит статус с занят на свободен, то сброс
// произойдёт принудительно
// @ts-ignore
export const maxTimeLimitForAccount = (+process.env.MAX_TIMELIMIT_ACCOUNT || 5) * 60 * 1000;

// Если взяли задачу в обработку и парсер упал,
// через сколько часов можно взять ее в обработку повторно?
// @ts-ignore
export const maxHoursTaskCanProcessing = +process.env.MAX_HOURS_TASK_PROCESSING || 1;

/* -- ProxyPoolFineproxy -- */
export const fineproxy = {
    login: process.env.FINEPROXY_LOGIN || '',
    pass: process.env.FINEPROXY_PASSWORD || '',
    updateTimer: 1000 * 60 * 60 * 6 // Через сколько обновлять прокси-лист
}
