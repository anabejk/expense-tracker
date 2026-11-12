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

        case 'popup_failed_to_open':
            return {
                title: 'Окно входа не открылось',
                status: 'popup',
                message: 'Разреши всплывающие окна или открой сайт в Safari / Chrome'
            }

        case 'popup_closed':
            return {
                title: 'Окно входа закрылось',
                status: 'popup',
                message: 'Если сайт открыт из Telegram или другого мессенджера — открой его в Safari или Chrome'
            }

        case 'unknown':
            return {
                title: 'Не удалось войти',
                status: 'popup',
                message: 'Попробуй открыть сайт в другом браузере'
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
