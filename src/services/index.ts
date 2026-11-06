// Services barrel export
export * from './base';
export { clientService } from './clients';
export { proposalService } from './proposals';
export { catalogService } from './catalog';
export { profileService } from './profiles';
export type {
  ClientRow,
  ClientInsert,
  ClientUpdate,
} from './clients';
export type {
  BudgetRow,
  BudgetInsert,
  BudgetUpdate,
  BudgetItemRow,
  BudgetItemInsert,
} from './proposals';
export type {
  CatalogItemRow,
  CatalogItemInsert,
  CatalogItemUpdate,
} from './catalog';
export type {
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
} from './profiles';



