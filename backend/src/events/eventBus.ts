/**
 * Internal in-process event bus.
 *
 * Used to decouple module side-effects from primary business logic.
 * Example: when the approval engine approves a budget request, it emits
 * a BudgetRequestApproved event. The notification module and audit module
 * subscribe independently without the approval service needing to know
 * about them.
 *
 * Implemented in M7 (Approval Engine milestone) when the first cross-module
 * event pattern is introduced.
 */
export {};
