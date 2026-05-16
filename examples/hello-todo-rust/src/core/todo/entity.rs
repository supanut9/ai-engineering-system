use chrono::{DateTime, Utc};
use thiserror::Error;
use uuid::Uuid;

/// Domain errors for todo validation.
#[derive(Debug, Error, PartialEq)]
pub enum Error {
    #[error("title is required")]
    TitleRequired,
    #[error("title must not exceed 200 characters")]
    TitleTooLong,
    #[error("todo not found")]
    NotFound,
}

/// Core domain entity.
#[derive(Debug, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub completed: bool,
    pub due_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Validated input for creating a new todo.
pub struct NewTodo {
    pub title: String,
    pub due_at: Option<DateTime<Utc>>,
}

impl NewTodo {
    /// Validate inputs and return a ready-to-store `Todo`.
    pub fn build(self) -> Result<Todo, Error> {
        let title = self.title.trim().to_string();
        if title.is_empty() {
            return Err(Error::TitleRequired);
        }
        if title.len() > 200 {
            return Err(Error::TitleTooLong);
        }

        let id = Uuid::new_v4().simple().to_string();
        let now = Utc::now();
        let due_at = self.due_at.map(|t| t.with_timezone(&Utc));

        Ok(Todo {
            id,
            title,
            completed: false,
            due_at,
            created_at: now,
            updated_at: now,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_todo_rejects_empty_title() {
        let err = NewTodo {
            title: "   ".into(),
            due_at: None,
        }
        .build()
        .unwrap_err();
        assert_eq!(err, Error::TitleRequired);
    }

    #[test]
    fn new_todo_rejects_title_over_200_chars() {
        let long = "a".repeat(201);
        let err = NewTodo {
            title: long,
            due_at: None,
        }
        .build()
        .unwrap_err();
        assert_eq!(err, Error::TitleTooLong);
    }

    #[test]
    fn new_todo_accepts_valid_title() {
        let todo = NewTodo {
            title: "Buy milk".into(),
            due_at: None,
        }
        .build()
        .unwrap();
        assert_eq!(todo.title, "Buy milk");
        assert!(!todo.completed);
        assert!(!todo.id.is_empty());
        assert_eq!(todo.id.len(), 32); // uuid simple format
    }

    #[test]
    fn new_todo_accepts_exactly_200_chars() {
        let title = "a".repeat(200);
        let todo = NewTodo {
            title: title.clone(),
            due_at: None,
        }
        .build()
        .unwrap();
        assert_eq!(todo.title.len(), 200);
    }

    #[test]
    fn new_todo_trims_whitespace() {
        let todo = NewTodo {
            title: "  hello  ".into(),
            due_at: None,
        }
        .build()
        .unwrap();
        assert_eq!(todo.title, "hello");
    }
}
