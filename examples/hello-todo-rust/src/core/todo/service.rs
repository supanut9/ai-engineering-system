use std::sync::Arc;

use chrono::Utc;

use super::entity::{Error as EntityError, NewTodo, Todo};
use super::repository::{Error as RepoError, TodoRepository};
use crate::ports::inbound::{CreateInput, Patch, TodoItem, TodoService as TodoServicePort};

/// Maps a repository error or entity error into a unified service error.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("title is required")]
    TitleRequired,
    #[error("title must not exceed 200 characters")]
    TitleTooLong,
    #[error("todo not found")]
    NotFound,
    #[error("internal error: {0}")]
    Internal(#[from] anyhow::Error),
}

impl From<EntityError> for Error {
    fn from(e: EntityError) -> Self {
        match e {
            EntityError::TitleRequired => Error::TitleRequired,
            EntityError::TitleTooLong => Error::TitleTooLong,
            EntityError::NotFound => Error::NotFound,
        }
    }
}

impl From<RepoError> for Error {
    fn from(e: RepoError) -> Self {
        match e {
            RepoError::NotFound => Error::NotFound,
            RepoError::Internal(e) => Error::Internal(e),
        }
    }
}

fn to_item(t: Todo) -> TodoItem {
    TodoItem {
        id: t.id,
        title: t.title,
        completed: t.completed,
        due_at: t.due_at,
        created_at: t.created_at,
        updated_at: t.updated_at,
    }
}

/// Core service implementing all business logic.
pub struct TodoService {
    repo: Arc<dyn TodoRepository>,
}

impl TodoService {
    pub fn new(repo: Arc<dyn TodoRepository>) -> Self {
        Self { repo }
    }
}

#[async_trait::async_trait]
impl TodoServicePort for TodoService {
    async fn create(&self, input: CreateInput) -> Result<TodoItem, Error> {
        let todo = NewTodo {
            title: input.title,
            due_at: input.due_at,
        }
        .build()?;
        let saved = self.repo.save(todo).await?;
        Ok(to_item(saved))
    }

    async fn list(&self) -> Result<Vec<TodoItem>, Error> {
        let todos = self.repo.find_all().await?;
        Ok(todos.into_iter().map(to_item).collect())
    }

    async fn get(&self, id: &str) -> Result<TodoItem, Error> {
        let todo = self.repo.find_by_id(id).await?;
        Ok(to_item(todo))
    }

    async fn update(&self, id: &str, patch: Patch) -> Result<TodoItem, Error> {
        let mut todo = self.repo.find_by_id(id).await?;

        if let Some(title) = patch.title {
            let title = title.trim().to_string();
            if title.is_empty() {
                return Err(Error::TitleRequired);
            }
            if title.len() > 200 {
                return Err(Error::TitleTooLong);
            }
            todo.title = title;
        }

        if patch.clear_due_at {
            todo.due_at = None;
        } else if let Some(due) = patch.due_at {
            todo.due_at = Some(due.with_timezone(&chrono::Utc));
        }

        if let Some(completed) = patch.completed {
            todo.completed = completed;
        }

        todo.updated_at = Utc::now();

        let saved = self.repo.save(todo).await?;
        Ok(to_item(saved))
    }

    async fn delete(&self, id: &str) -> Result<(), Error> {
        self.repo.delete(id).await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::adapters::outbound::memory::store::MemoryStore;

    fn make_service() -> TodoService {
        let store = Arc::new(MemoryStore::new());
        TodoService::new(store)
    }

    #[tokio::test]
    async fn create_and_get_round_trip() {
        let svc = make_service();
        let item = svc
            .create(CreateInput {
                title: "Test todo".into(),
                due_at: None,
            })
            .await
            .unwrap();
        let fetched = svc.get(&item.id).await.unwrap();
        assert_eq!(fetched.id, item.id);
        assert_eq!(fetched.title, "Test todo");
        assert!(!fetched.completed);
    }

    #[tokio::test]
    async fn update_applies_title_patch() {
        let svc = make_service();
        let item = svc
            .create(CreateInput {
                title: "Original".into(),
                due_at: None,
            })
            .await
            .unwrap();
        let updated = svc
            .update(
                &item.id,
                Patch {
                    title: Some("Updated".into()),
                    ..Default::default()
                },
            )
            .await
            .unwrap();
        assert_eq!(updated.title, "Updated");
        assert!(updated.updated_at >= item.updated_at);
    }

    #[tokio::test]
    async fn delete_returns_not_found_after() {
        let svc = make_service();
        let item = svc
            .create(CreateInput {
                title: "Delete me".into(),
                due_at: None,
            })
            .await
            .unwrap();
        svc.delete(&item.id).await.unwrap();
        let err = svc.get(&item.id).await.unwrap_err();
        assert!(matches!(err, Error::NotFound));
    }

    #[tokio::test]
    async fn create_rejects_empty_title() {
        let svc = make_service();
        let err = svc
            .create(CreateInput {
                title: "".into(),
                due_at: None,
            })
            .await
            .unwrap_err();
        assert!(matches!(err, Error::TitleRequired));
    }
}
