class DomainError(Exception):
    """Base class for domain errors."""


class InvalidTransitionError(DomainError):
    """Raised when a state transition is not allowed."""


class DocumentRequiredError(DomainError):
    """Raised when an obligation requires a document before submission."""


class ConcurrencyConflictError(DomainError):
    """Raised when optimistic locking detects a concurrent update."""


class InvalidDueDateError(DomainError):
    """Raised when a due date is invalid for the obligation."""


class EntityNotFoundError(DomainError):
    """Raised when an entity cannot be found."""