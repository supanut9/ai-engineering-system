use async_trait::async_trait;

use super::entity::{Error as EntityError, Todo};

/// Errors the repository can return.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("todo not found")]
    NotFound,
    #[error("repository error: {0}")]
    Internal(#[from] anyhow::Error),
}

impl From<EntityError> for Error {
    fn from(e: EntityError) -> Self {
        match e {
            EntityError::NotFound => Error::NotFound,
            other => Error::Internal(anyhow::anyhow!("{}", other)),
        }
    }
}

/// Outbound port that the service depends on.
/// Adapters implement this interface; the core package owns the definition.
#[async_trait]
pub trait TodoRepository: Send + Sync + 'static {
    async fn save(&self, todo: Todo) -> Result<Todo, Error>;
    async fn find_all(&self) -> Result<Vec<Todo>, Error>;
    async fn find_by_id(&self, id: &str) -> Result<Todo, Error>;
    async fn delete(&self, id: &str) -> Result<(), Error>;
}
