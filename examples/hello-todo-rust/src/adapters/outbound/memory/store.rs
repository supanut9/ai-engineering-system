use std::collections::HashMap;

use async_trait::async_trait;
use tokio::sync::RwLock;

use crate::core::todo::entity::Todo;
use crate::core::todo::repository::{Error, TodoRepository};

struct State {
    items: HashMap<String, Todo>,
    order: Vec<String>,
}

impl State {
    fn new() -> Self {
        Self {
            items: HashMap::new(),
            order: Vec::new(),
        }
    }
}

/// Thread-safe in-memory implementation of `TodoRepository`.
/// Preserves insertion order for list operations.
pub struct MemoryStore {
    state: RwLock<State>,
}

impl MemoryStore {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(State::new()),
        }
    }
}

impl Default for MemoryStore {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl TodoRepository for MemoryStore {
    async fn save(&self, todo: Todo) -> Result<Todo, Error> {
        let mut state = self.state.write().await;
        if !state.items.contains_key(&todo.id) {
            state.order.push(todo.id.clone());
        }
        // Store a clone so callers cannot mutate internal state through the value.
        state.items.insert(todo.id.clone(), todo.clone());
        Ok(todo)
    }

    async fn find_all(&self) -> Result<Vec<Todo>, Error> {
        let state = self.state.read().await;
        let result = state
            .order
            .iter()
            .filter_map(|id| state.items.get(id).cloned())
            .collect();
        Ok(result)
    }

    async fn find_by_id(&self, id: &str) -> Result<Todo, Error> {
        let state = self.state.read().await;
        state.items.get(id).cloned().ok_or(Error::NotFound)
    }

    async fn delete(&self, id: &str) -> Result<(), Error> {
        let mut state = self.state.write().await;
        if !state.items.contains_key(id) {
            return Err(Error::NotFound);
        }
        state.items.remove(id);
        state.order.retain(|oid| oid != id);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::core::todo::entity::NewTodo;

    fn make_todo(title: &str) -> Todo {
        NewTodo {
            title: title.into(),
            due_at: None,
        }
        .build()
        .unwrap()
    }

    #[tokio::test]
    async fn save_and_find_all_preserves_insertion_order() {
        let store = MemoryStore::new();
        let a = make_todo("Alpha");
        let b = make_todo("Beta");
        let c = make_todo("Gamma");

        store.save(a.clone()).await.unwrap();
        store.save(b.clone()).await.unwrap();
        store.save(c.clone()).await.unwrap();

        let all = store.find_all().await.unwrap();
        assert_eq!(all.len(), 3);
        assert_eq!(all[0].title, "Alpha");
        assert_eq!(all[1].title, "Beta");
        assert_eq!(all[2].title, "Gamma");
    }

    #[tokio::test]
    async fn delete_removes_item() {
        let store = MemoryStore::new();
        let todo = make_todo("Delete me");
        store.save(todo.clone()).await.unwrap();

        store.delete(&todo.id).await.unwrap();

        let all = store.find_all().await.unwrap();
        assert!(all.is_empty());

        let err = store.find_by_id(&todo.id).await.unwrap_err();
        assert!(matches!(err, Error::NotFound));
    }

    #[tokio::test]
    async fn delete_nonexistent_returns_not_found() {
        let store = MemoryStore::new();
        let err = store.delete("nonexistent-id").await.unwrap_err();
        assert!(matches!(err, Error::NotFound));
    }

    #[tokio::test]
    async fn save_overwrites_existing() {
        let store = MemoryStore::new();
        let mut todo = make_todo("Original");
        store.save(todo.clone()).await.unwrap();

        todo.title = "Updated".into();
        store.save(todo.clone()).await.unwrap();

        let all = store.find_all().await.unwrap();
        assert_eq!(all.len(), 1);
        assert_eq!(all[0].title, "Updated");
    }
}
