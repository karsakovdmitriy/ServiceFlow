# Инструкция по деплою TrainerSpace на Vercel

Этот проект оптимизирован для работы на платформе **Vercel**. Следуйте этой инструкции для быстрого запуска вашего прототипа в облаке.

## 1. Подготовка

1. **GitHub:** Загрузите ваш код в репозиторий на GitHub.
2. **Supabase:** Убедитесь, что вы создали проект в Supabase и выполнили SQL-скрипт из `docs/supabase_schema.sql`.
3. **Telegram:** Создайте бота через `@BotFather` и сохраните токен.

## 2. Деплой через Vercel Dashboard

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard) и нажмите **"Add New" -> "Project"**.
2. Импортируйте ваш репозиторий из GitHub.
3. В разделе **Environment Variables** добавьте следующие переменные:

| Ключ | Описание | Откуда взять |
|------|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL вашего проекта Supabase | Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key (public) | Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (secret) | Settings -> API |
| `TELEGRAM_BOT_TOKEN` | Токен вашего бота | BotFather |
| `TELEGRAM_BOT_SECRET` | Секретное слово для вебхука | Придумайте сами |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Username бота (без @) | BotFather |

4. Нажмите **"Deploy"**.

## 3. Настройка Webhook (после деплоя)

После успешного деплоя Vercel выдаст вам URL (например, `https://trainerspace-my-id.vercel.app`). Вам нужно зарегистрировать этот URL в Telegram для работы бота.

Выполните запрос в браузере:

`https://api.telegram.org/bot<ВАШ_ТОКЕН>/setWebhook?url=https://<ВАШ_ДОМЕН_VERCEL>/api/bot?secret=<ВАШ_СЕКРЕТ>`

## 4. Обновление кода

После того как проект подключен к Vercel, каждое ваше изменение в основной ветке (main/master) на GitHub будет автоматически запускать пересборку и обновление приложения в облаке.

## 5. Режим разработки (Preview)

Vercel автоматически создает "Preview Deployments" для каждой ветки или Pull Request. Это позволяет тестировать изменения перед тем, как они попадут в основную версию. Убедитесь, что для Preview-версий также настроены переменные окружения, если вы планируете их использовать.
