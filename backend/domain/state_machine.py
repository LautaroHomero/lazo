from domain.enums import ObligationStatus
from domain.errors import InvalidTransitionError


class StateMachine:

    _TRANSITIONS = {
        ObligationStatus.PENDING: {
            ObligationStatus.IN_PROGRESS,
        },

        ObligationStatus.IN_PROGRESS: {
            ObligationStatus.PENDING,
            ObligationStatus.SUBMITTED,
        },

        ObligationStatus.SUBMITTED: {
            ObligationStatus.DONE,
            ObligationStatus.IN_PROGRESS,
        },

        ObligationStatus.DONE: {
            ObligationStatus.IN_PROGRESS,
        },
    }

    @classmethod
    def can_transition(
        cls,
        current: ObligationStatus,
        new: ObligationStatus,
    ) -> bool:

        return new in cls._TRANSITIONS.get(current, set())

    @classmethod
    def validate_transition(
        cls,
        current: ObligationStatus,
        new: ObligationStatus,
    ) -> None:

        if not cls.can_transition(current, new):
            raise InvalidTransitionError(
                f"Cannot transition from {current} to {new}"
            )

    @classmethod
    def allowed_transitions(
        cls,
        current: ObligationStatus,
    ) -> list[ObligationStatus]:

        return sorted(
            cls._TRANSITIONS.get(current, set()),
            key=lambda status: status.value,
        )
    

""" Agregar un nuevo estado significa cambiar únicamente esto:

_TRANSITIONS = {
    ...
}

No tocamos ninguna lógica.

No aparecen veinte if.

Los tests son muchísimo más simples."""