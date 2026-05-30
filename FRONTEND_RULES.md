# Правила фронтенда

Стек: Next.js · React · TypeScript · Tailwind CSS

---

## Архитектура

1. Подгружай динамически всё тяжёлое и редко нужное — модалки, тяжёлые виджеты, настройки. Ядро экрана и утилиты — статически.
2. Параллелизуй независимые вызовы через `Promise.all`. Последовательно — только когда второй вызов зависит от результата первого.
3. API-методы пробрасывают ошибки наружу, если не обрабатывают их сами — вызывающий код решает, что делать.
4. Мапперы (преобразование данных) живут рядом с api-методом, который их использует.
5. Новые внешние библиотеки — согласовывать перед установкой.
6. Типы храни в `*.types.ts` рядом с модулем, который их породил. Не выноси в глобальную папку `types/`.
7. Константы не выносить преждевременно. Если нужно — в `config/`, а не `constants/`.
8. Не меняй возвращаемый тип существующего метода, не обновив все места вызова.
9. Визуальные задачи решай через CSS, а не JS (анимации, переходы, скрытие элементов).
10. Учитывай переполнение контента: длинный текст, строки без пробелов — добавляй `truncate`/`overflow-hidden`/`ellipsis`.
11. SRP (принцип единственной ответственности) — ключевой при декомпозиции.

### Динамическая загрузка

```tsx
// Хорошо — тяжёлый компонент загружается только при открытии
const HeavyModal = dynamic(() => import('@/components/HeavyModal'), { ssr: false });

// Плохо — статический импорт тащит всё в начальный бандл
import { HeavyModal } from '@/components/HeavyModal';
```

### Параллелизация

```ts
// Хорошо — независимые запросы параллельно
const [summary, history] = await Promise.all([
  getDashboardSummary(),
  getPortfolioHistory(),
]);

// Норма — последовательно при зависимости по данным
const user = await getUserState();
const profile = await getProfile(user.id);

// Плохо — параллель с зависимостью
const [user, profile] = await Promise.all([
  getUser(),
  getProfile(user.id), // user ещё не готов
]);
```

---

## Стиль кода

1. Только именованные экспорты — никаких `export default`.
2. Используй ES6-методы (`Array.prototype.find`, `Object.entries`, деструктуризация и т.д.).
3. Явный `return`, если функция возвращает значение.
4. `switch` предпочтительнее цепочки `if` при перечислении вариантов union/enum — компилятор сообщит о незакрытых кейсах.
5. Пустая строка в конце файла.
6. `||` — дефолт по умолчанию (falsy-коэрсия: `0`, `''`, `false` → дефолт). `??` — только когда нужно явно отличить `null/undefined` от `0` или `''`; в этом случае обязателен комментарий.
7. Выноси в константу, если значение повторяется или семантика неочевидна. Тривиальные литералы (`0`, `1`, `''`) можно оставлять инлайном.
8. `async/await` вместо `.then()`.
9. Строковые пропсы без лишних фигурных скобок: `label="Войти"`, не `label={"Войти"}`.
10. Деструктуризация при любой возможности.
11. Условия Йоды (`'x' === getType()`) запрещены.
12. Присваивание внутри условия запрещено.
13. Function declaration — только для перегрузок; в остальных случаях стрелочная функция.
14. Комментарии — на русском.
15. Всегда используй фигурные скобки в `if`, `else`, `for`, `while` — однострочная форма без скобок запрещена.
16. Каждый файл должен заканчиваться пустой строкой (символом `\n` после последней строки кода).

```ts
// Хорошо
if (navigatedRef.current) {
  return;
}

// Плохо — нет скобок
if (navigatedRef.current) return;
```

### `switch` vs `if`

```ts
// Хорошо — TS сообщит, если добавили новый Period и не обработали
switch (period) {
  case '1w':
    return 7;
  case '1m':
    return 30;
  case '3m':
    return 90;
  default:
    throw new Error(`Неизвестный период: ${period}`);
}

// Плохо — добавили новый кейс, забыли обработать, TS промолчал
if (period === '1w') return 7;
if (period === '1m') return 30;
```

### `||` vs `??`

```ts
// Хорошо — стандартный дефолт
const label = account.name || 'Без названия';

// Хорошо с комментарием — нужно различать 0 и отсутствие значения
// нужно сохранить выбор пользователя «0 операций»; undefined считаем «не задано»
const count = userCount ?? DEFAULT_COUNT;
```

---

## Именование

1. Переменные — `camelCase`. Константы — `SCREAMING_SNAKE_CASE`. Классы и компоненты — `PascalCase`.
2. Типы и интерфейсы без венгерской нотации: не `IData`, не `TUser` — просто `Data`, `User`.
3. Обработчики событий — с префиксом `handle` (`handleButtonClick`). Колбэки в пропсах — с префиксом `on` (`onClose`, `onSuccess`).
4. Булевы переменные и пропсы — только с разрешёнными префиксами:

   | Префикс  | Когда                                            | Где              |
   |----------|--------------------------------------------------|------------------|
   | `is`     | текущее состояние: `isOpen`, `isLoading`         | везде            |
   | `has`    | наличие чего-то: `hasError`, `hasContent`        | везде            |
   | `should` | необходимость действия: `shouldFocus`            | везде            |
   | `are`    | состояние коллекции: `areItemsSelected`          | только React-пропсы |
   | `have`   | наличие у коллекции: `haveResults`               | только React-пропсы |
   | `must`   | строгое требование: `mustConfirmClose`           | только React-пропсы |
   | `with`   | флаг включения подсистемы: `withFooter`          | только React-пропсы |

   ```ts
   // Хорошо
   const isLoading = true;
   const hasErrors = errors.length > 0;

   // Плохо — префиксы вне списка
   const enabled = true;
   const canEdit = true;
   const visible = false;
   ```

5. Интерфейс пропсов компонента — `{ComponentName}Props`.
6. Имя файла совпадает с именем директории: `Select/Select.tsx`.
7. Короткие, но точные имена. Не сокращай до неузнаваемости.

---

## TypeScript

1. Типы, интерфейсы, пропсы — в отдельных `*.types.ts` файлах рядом с компонентом.
2. Для перечислений — `as const`-объекты или `const enum`. Обычный `enum` — только там, где нужен runtime-доступ (`Object.values`, передача между модулями).
3. Не используй `any`. Если типизировать действительно невозможно — оставь комментарий почему.
4. Type-guard держи функцией рядом с типом, который проверяет.
5. Локальные алиасы допустимы внутри файла для упрощения чтения сложных generics.
6. `T[]` вместо `Array<T>`.
7. Используй generics для `setQueryData` и `useFormContext` — иначе поля становятся `any`.
8. Не инлайни типы в теле функции — выноси в `*.types.ts`.
9. Не кастуй через `as` без обоснования. Оправданные случаи: `as const`, сразу после type-guard/валидации, сужение `unknown` после явной проверки, баг TypeScript (с комментарием).

### Структура компонента

```
Select/
├── Select.tsx
├── Select.types.ts    // SelectProps, SelectOption, ...
└── index.ts
```

### `as const` и type-guard

```ts
// Хорошо
const PERIODS = ['1w', '1m', '3m'] as const;
type Period = typeof PERIODS[number];

// Хорошо — type-guard без лишнего as
const isApiError = (value: unknown): value is ApiError => {
  return value instanceof ApiError;
};

if (isApiError(err)) {
  showToast(err.message); // err: ApiError — без as
}

// Плохо — каст без проверки
const user = response.data as User;

// Плохо — двойной каст для заглушения ошибки
const config = rawValue as unknown as Config;
```

### Алиасы для читаемости

```ts
// Хорошо
type PointsByPeriod = Record<Period, PortfolioHistoryPoint[]>;
const groupPoints = (points: PortfolioHistoryPoint[]): PointsByPeriod => { ... };

// Плохо
const groupPoints = (
  points: PortfolioHistoryPoint[],
): Record<Period, PortfolioHistoryPoint[]> => { ... };
```

---

## React

1. Не передавай стрелочные функции напрямую в `on`-пропсы — объявляй хендлеры отдельно.
2. Не передавай методы напрямую в `on`-колбэки — создавай хендлеры-обёртки.
3. Из хуков возвращай чистые методы (`save`, `reset`), а не хендлеры (`handleSave`).
4. В пропсы передавай только колбэки (`onSave`, `onClose`) — не сеттеры (`setIsOpen`).
5. `useMemo` — только для нетривиальных вычислений. Для фильтрации/сортировки — `useMemo`, не `useEffect` с `setState`.
6. Деструктуризация пропсов — первой строкой в теле функции.
7. Логику (хуки, вычисления) выноси в отдельные файлы хуков, не храни в компонентах.
8. Между JSX-соседями одного уровня — пустая строка.
9. В `useState` используй `null` для отсутствующего значения, а не пустой объект.
10. Для compound-компонентов — слоты, композиция, контекст вместо флагов и props drilling.
11. Минимизируй число пропсов.

### Хендлеры

```tsx
// Хорошо
const handleSubmit = () => {
  onSave(formData);
};

return <Button onClick={handleSubmit} />;

// Плохо — стрелка прямо в JSX
return <Button onClick={() => onSave(formData)} />;
```

### Хуки возвращают методы, не хендлеры

```ts
// Хорошо — хук возвращает метод
const useAuth = () => {
  const logout = () => { ... };
  return { logout };
};

// В компоненте компонент объявляет хендлер
const { logout } = useAuth();
const handleLogout = () => {
  logout();
  router.push('/login');
};

// Плохо — хук возвращает хендлер
const useAuth = () => {
  const handleLogout = () => { logout(); router.push('/login'); };
  return { handleLogout };
};
```

### `FC<Props>` с явной типизацией

```tsx
// Button.types.ts
export interface ButtonProps {
  label: string;
  onClick: () => void;
  isDisabled?: boolean;
}

// Button.tsx
import type { FC } from 'react';
import type { ButtonProps } from './Button.types';

export const Button: FC<ButtonProps> = (props) => {
  const { label, onClick, isDisabled } = props;
  return <button onClick={onClick} disabled={isDisabled}>{label}</button>;
};

// Плохо — нет FC, нет интерфейса
export const Button = (props) => { ... };

// Плохо — инлайн тип
export const Button: FC<{ label: string; onClick: () => void }> = (props) => { ... };
```

---

## React-архитектура

1. Query-ключи — функции-фабрики. Один файл `queries.ts` — единственная точка правды.
2. Дочерние компоненты compound-компонента — каждый в своей папке.
3. Не переиспользуй пропсы одного компонента в другом. Заводи отдельный интерфейс, даже если поля сейчас совпадают.
4. Контекст компонента — отдельный `*.context.ts` с типизированным провайдером и хуком.

### Query-ключи как фабрики

```ts
// queries.ts
const BASE = 'portfolio';

export const queries = {
  history: (from?: string) => [BASE, 'history', from] as const,
  summary: () => [BASE, 'summary'] as const,
};

// Хорошо
useQuery({ queryKey: queries.history(from), queryFn: fetchHistory });
queryClient.invalidateQueries({ queryKey: queries.history(from) });

// Плохо — строки расползаются по файлам, легко рассинхронить
useQuery({ queryKey: ['portfolio', 'history', from], queryFn: fetchHistory });
```

### Структура compound-компонента

```
PortfolioChart/
├── PortfolioChart.tsx
├── PortfolioChart.types.ts
├── PeriodSelector/
│   └── PeriodSelector.tsx
├── ChartTooltip/
│   └── ChartTooltip.tsx
├── useChartData/
│   └── useChartData.ts
└── index.ts
```

---

## Стили (Tailwind)

1. Цвета бери из CSS-переменных, объявленных в `globals.css` (`--color-primary`, `--color-bg-dark` и т.д.). Не хардкоди hex-значения в `style={{}}`.
2. Не добавляй margin/padding на внешний элемент компонента без необходимости — это ответственность родителя. Исключение: когда у элемента есть border или background, визуально задающий его границы.
3. Избегай каскадных стилей — не завязывайся на структуру DOM-родителей.
4. Не переопределяй глобальные классы внутри компонента.
5. Для тёмной темы используй класс `dark` на `<html>` и CSS-переменные в `globals.css`. Не проверяй тему через JS там, где достаточно CSS.

---

## Линтинг и типизация

1. После каждой правки `.ts`/`.tsx` — проверь типы: `rtk tsc`.
2. Перед завершением задачи — убедись, что нет ошибок TypeScript.
3. Запрещено:
   - `// eslint-disable`, `@ts-ignore`, `@ts-expect-error` ради прохождения проверки;
   - `any`, `as unknown as T`, `@ts-nocheck`;
   - ослаблять или удалять правила в конфигах.
4. Если не знаешь, как исправить правильно — разбирайся с причиной, не прячь в TODO.