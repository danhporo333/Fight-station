// Public API của feature branch: những gì app.ts cần để nối dây.
// BranchService thỏa BranchLookup của game (existsAll, findAllIds); app.ts truyền vào GameService.
export { BranchController } from './branch.controller';
export { BranchRepository } from './branch.repository';
export { createBranchRouter } from './branch.routes';
export { BranchService } from './branch.service';
export type { Branch } from './branch.entity';
