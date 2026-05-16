# screens — hello-todo-react-native-expo

Wireframe-level description of every screen in the app. Implementation must follow these
layouts. Pixel-perfect styling is out of scope for v0.1.0; this document specifies
structure and interaction, not visual design.

---

## navigation structure

```
Stack (root layout — app/_layout.tsx)
├── index          → app/index.tsx   (list screen, always present)
└── add (modal)    → app/add.tsx     (modal presentation, pushed on demand)
```

The root `Stack` in `app/_layout.tsx` declares both routes. The `add` screen uses
`presentation: 'modal'` in the stack options so it slides up from the bottom on iOS and
uses a bottom sheet-style animation on Android.

---

## screen 1: list screen (`app/index.tsx`)

### purpose

The home screen. Displays all todos and provides navigation to the add screen.

### layout (top to bottom)

```
┌─────────────────────────────────┐
│  [Header] "My Todos"            │
├─────────────────────────────────┤
│                                 │
│  [Loading indicator]            │  ← shown while AsyncStorage read is in flight
│        — or —                   │
│  [Empty state]                  │  ← "No todos yet" when list is empty
│        — or —                   │
│  ┌─────────────────────────┐    │
│  │ [☐] Buy milk      [✕]  │    │  ← todo item (incomplete)
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ [☑] Call dentist  [✕]  │    │  ← todo item (completed, title struck through)
│  └─────────────────────────┘    │
│                                 │
│               ...               │
│                                 │
├─────────────────────────────────┤
│  [+ Add Todo]  (bottom button)  │
└─────────────────────────────────┘
```

### components

| component | file | notes |
|---|---|---|
| `TodoList` | `components/TodoList.tsx` | renders `FlatList` or `ScrollView` of `TodoItem`; passes `onToggle` and `onDelete` callbacks |
| `TodoItem` | `components/TodoItem.tsx` | renders one row: toggle control, title, delete control |
| Empty state | inline in `app/index.tsx` | `<Text>No todos yet</Text>` inside a centered container |
| Loading state | inline in `app/index.tsx` | `<ActivityIndicator />` centered on screen |
| Add button | `components/AddButton.tsx` or inline | `Pressable` or `TouchableOpacity` at bottom; calls `router.push('/add')` |

### interactions

| action | trigger | result |
|---|---|---|
| Open add screen | Tap "Add Todo" button | `router.push('/add')`; add modal slides up |
| Toggle todo | Tap checkbox / toggle control on a `TodoItem` | `useTodos().toggleTodo(id)` called; list re-renders |
| Delete todo | Tap delete control on a `TodoItem` | `useTodos().deleteTodo(id)` called; item removed from list |

### state

Provided entirely by the `useTodos` hook:

```
const { todos, loading, addTodo, toggleTodo, deleteTodo } = useTodos();
```

The screen does not manage its own state beyond what this hook exposes.

---

## screen 2: add screen (`app/add.tsx`)

### purpose

A modal screen for creating a new todo. Presented as a modal route.

### layout (top to bottom)

```
┌─────────────────────────────────┐
│  [Cancel]   "Add Todo"  [Save]  │  ← modal header (or equivalent)
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐    │
│  │  Title                  │    │  ← TextInput, auto-focused on open
│  │  ─────────────────────  │    │
│  │  [placeholder text]     │    │
│  └─────────────────────────┘    │
│  [Error: Title is required]     │  ← inline validation message (hidden when valid)
│                                 │
└─────────────────────────────────┘
```

### components

| component | file | notes |
|---|---|---|
| Title input | `components/TitleInput.tsx` or inline | controlled `TextInput`; `autoFocus`; `maxLength` hint (200) |
| Validation message | inline in `app/add.tsx` | conditional `<Text style={styles.error}>` |
| Save button | in header or inline `Pressable` | calls submit handler |
| Cancel button | in header or system back gesture | calls `router.back()` without creating a todo |

### interactions

| action | trigger | result |
|---|---|---|
| Auto-focus input | Screen opens | `TextInput` gains focus; keyboard appears |
| Validate on submit | Tap Save | trim title; check non-empty and ≤ 200 chars; show error or proceed |
| Create todo | Valid title, tap Save | `useTodos().addTodo(trimmedTitle)` called; `router.back()` called |
| Cancel | Tap Cancel or swipe down (modal dismiss) | `router.back()`; list unchanged |

### state

```
const [title, setTitle] = useState('');
const [error, setError] = useState<string | null>(null);
```

The `useTodos` hook is consumed for the `addTodo` callback.

---

## root layout (`app/_layout.tsx`)

Wraps the entire app in a `Stack` navigator. No data fetching.

```tsx
<Stack>
  <Stack.Screen name="index" options={{ title: 'My Todos' }} />
  <Stack.Screen name="add" options={{ presentation: 'modal', title: 'Add Todo' }} />
</Stack>
```

`SafeAreaProvider` from `react-native-safe-area-context` is applied at this level so all
screens are inset-aware.

---

## screen transitions

| transition | behavior |
|---|---|
| index → add | modal slide-up (iOS: default modal; Android: bottom-up slide) |
| add → index (back) | modal slide-down; list screen resumes from foreground |

No custom animations are implemented in v0.1.0; Expo Router's default `Stack` transitions
are used.
