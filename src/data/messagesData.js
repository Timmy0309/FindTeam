// База данных сообщений для разных диалогов
export const messagesData = {
  1: [ // Диалог с lesha (id=1)
    { id: 1, message: "Привет! Собираем команду для CS2, нужен снайпер", author: "lesha", time: "19:30" },
    { id: 2, message: "Я больше на рифлах играю, но могу попробовать", author: "Я", isMyMessage: true, time: "19:32" },
    { id: 3, message: "Ок, давай в тестовую зайдем? У тебя какой ранг?", author: "lesha", time: "19:33" },
    { id: 4, message: "Легенда блейд, но давно не калибровался", author: "Я", isMyMessage: true, time: "19:35" },
    { id: 5, message: "Норм, у нас такие же. Кидаю инвайт в стиме", author: "lesha", time: "19:36" },
    { id: 6, message: "Принял, залетаю", author: "Я", isMyMessage: true, time: "19:38" }
  ],
  
  2: [ // Диалог с Арсений (id=2)
    { id: 1, message: "Нужен мидер в доту 2, играем вечером", author: "Арсений", time: "15:20" },
    { id: 2, message: "Какой рейтинг? Я 3500", author: "Я", isMyMessage: true, time: "15:22" },
    { id: 3, message: "У нас от 3000 до 4000, подходишь", author: "Арсений", time: "15:23" },
    { id: 4, message: "На какых героях играешь?", author: "Я", isMyMessage: true, time: "15:25" },
    { id: 5, message: "Призрак, эмбер, пудж. Без разницы", author: "Арсений", time: "15:26" },
    { id: 6, message: "Отлично, добавляй в друзья - ArsDota", author: "Арсений", time: "15:27" }
  ],
  
  3: [ // Диалог с Zhaglo (id=3)
    { id: 1, message: "Ищем тиммейта для Valorant, нужен инициатор", author: "Zhaglo", time: "11:45" },
    { id: 2, message: "Я обычно на дуэлянтах играю, но могу попробовать", author: "Я", isMyMessage: true, time: "11:47" },
    { id: 3, message: "Пойдет, какой у тебя ранг?", author: "Zhaglo", time: "11:48" },
    { id: 4, message: "Платинум 2, но близко к диаманту", author: "Я", isMyMessage: true, time: "11:50" },
    { id: 5, message: "Круто, мы платинум 1-3. Зайдешь сегодня в 21:00?", author: "Zhaglo", time: "11:52" },
    { id: 6, message: "Да, скинь дискорд сервер", author: "Я", isMyMessage: true, time: "11:53" }
  ],
  
  4: [ // Диалог с timmy (id=4)
    { id: 1, message: "Привет! Смотрю ты ищешь команду в Apex Legends", author: "timmy", time: "09:10" },
    { id: 2, message: "Да, нужны сокомандники для ранкеда", author: "Я", isMyMessage: true, time: "09:12" },
    { id: 3, message: "Мы с другом ищем третьего, платинум 4", author: "timmy", time: "09:13" },
    { id: 4, message: "Я голд 1, но быстро расту", author: "Я", isMyMessage: true, time: "09:15" },
    { id: 5, message: "Ничего страшного, главное командная игра", author: "timmy", time: "09:16" },
    { id: 6, message: "У тебя микрофон есть?", author: "timmy", time: "09:16" },
    { id: 7, message: "Да, есть. Давай попробуем сыграть сегодня", author: "Я", isMyMessage: true, time: "09:18" }
  ]
};

// Данные о пользователях (диалогах)
export const dialogsData = [
  { 
    id: "1", 
    name: "lesha", 
    lastMessage: "Принял, залетаю", 
    avatar: "L",
    game: "CS2",
    online: true
  },
  { 
    id: "2", 
    name: "Арсений", 
    lastMessage: "ArsDota - добавляй", 
    avatar: "А",
    game: "Dota 2",
    online: false
  },
  { 
    id: "3", 
    name: "Zhaglo", 
    lastMessage: "Скинь дискорд сервер", 
    avatar: "Z",
    game: "Valorant",
    online: true
  },
  { 
    id: "4", 
    name: "timmy", 
    lastMessage: "Давай попробуем сегодня", 
    avatar: "T",
    game: "Apex Legends",
    online: true
  }
];