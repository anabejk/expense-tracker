export function getReadableError(error) {
    const code = error?.status || error?.result?.error?.code

    switch (code) {
        case 400:
            return {
                title: 'Bad Request',
                status: 400,
                message: 'Проверь настройки таблицы'
            }

        case 401:
            return {
                title: 'Сессия истекла',
                status: 401,
                message: 'Нужно войти заново'
            }

        case 403:
            return {
                title: 'Нет доступа',
                status: 403,
                message: 'Проверь Google аккаунт'
            }

        case 404:
            return {
                title: 'Таблица не найдена',
                status: 404,
                message: 'Проверь настройки приложения'
            }

        case 429:
            return {
                title: 'Слишком много запросов',
                status: 429,
                message: 'Попробуй через несколько секунд'
            }

        case 503:
            return {
                title: 'Сервис временно недоступен',
                status: 503,
                message: 'Попробуй позже'
            }

        default:
            console.warn('Необработанная ошибка:', code, error)

            return {
                title: 'Что-то пошло не так',
                status: code || 'неизвестная ошибка',
                message: 'Попробуй повторить действие'
            }
    }
}
