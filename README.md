# TrainerSpace — Кабинет тренера (Прототип)

Инструкция по развертке и запуску работоспособного прототипа системы управления тренировками.

## Технологический стек
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Database & Auth), Next.js API Routes
- **Интеграция**: Telegram Bot API

---

## 1. Предварительные требования
- Установленный **Node.js** (версия 18.x или выше)
- Аккаунт в **Supabase**
- Зарегистрированный бот в Telegram через [@BotFather](https://t.me/BotFather)

## 2. Установка
1. Клонируйте репозиторий.
2. Перейдите в директорию проекта.
3. Установите зависимости:
   ```bash
   npm install
   ```

## 3. Настройка Supabase
1. Создайте новый проект в [Supabase](https://supabase.com/).
2. Перейдите в раздел **SQL Editor**.
3. Скопируйте содержимое файла `docs/supabase_schema.sql` и выполните его. Это создаст необходимые таблицы: `trainers`, `clients`, `sessions`, `schedule_config` и `blocked_slots`.
4. В настройках проекта (Project Settings -> API) скопируйте `Project URL` и `anon key`.

## 4. Настройка переменных окружения
Создайте файл `.env.local` в корне проекта и добавьте следующие переменные:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
TELEGRAM_BOT_TOKEN=your-bot-token
```

## 5. Настройка Telegram-бота
Чтобы бот мог обрабатывать заявки, необходимо установить Webhook на ваш развернутый API:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DOMAIN>/api/bot"
```
*Для локальной разработки используйте [ngrok](https://ngrok.com/) для проброса порта 3000.*

## 6. Запуск проекта

### Режим разработки
```bash
npm run dev
```
Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### Сборка для продакшена
```bash
npm run build
npm start
```

---

## Структура проекта
- `src/app/` — Страницы и API роуты (App Router).
- `src/components/` — Переиспользуемые UI компоненты (Sidebar, Topbar).
- `src/lib/` — Инициализация клиента Supabase.
- `docs/` — SQL схема базы данных и макет.

## Особенности прототипа
- **Адаптивность**: Полная поддержка мобильных устройств (выдвижное меню).
- **Локализация**: Интерфейс полностью на русском языке.
- **Интеграция**: Готовый API роут для обработки команд Telegram-бота.
